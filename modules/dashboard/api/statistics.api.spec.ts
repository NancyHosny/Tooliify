import { test, expect } from '../../shared/bug-capture';
import { StatisticsClient } from '../clients/StatisticsClient';
import { MyToolsClient } from '../../tools/clients/MyToolsClient';
import { getMerchantToken } from '../../shared/merchant-token';
import { apiUrl, unknownId, notNumericId, fakeJwt, statisticsApi, invalidDateFilters } from '../../../test-data/test-data';

// شكل أداة وكارت في رد لوحة التحكم.
type Tool = { views: number; clicks: number; interactions: number };

// تستات API لإحصائيات لوحة التحكم (تاج الـ OpenAPI: "Tool Statistics").
// ملحوظة: الـ API بيسمح بـ 10 طلبات في الدقيقة، فعميل الإحصائيات بيستنى بين الطلبات (الملف كله بياخد كام دقيقة).
test.describe('Statistics – API', () => {
  // نتخطى كل التستات لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');
  // الانتظار بين الطلبات بيزوّد وقت التست.
  test.describe.configure({ timeout: 90_000 });

  // العملاء، وكل مرة بنجيبهم من جديد.
  let statistics: StatisticsClient;
  let myTools: MyToolsClient;

  // قبل كل تست: نجيب توكن التاجر (مرة واحدة لكل الـ worker) ونعمل العملاء.
  test.beforeEach(async ({ request }) => {
    const token = await getMerchantToken(request);
    statistics = new StatisticsClient(request, token);
    myTools = new MyToolsClient(request, token);
  });

  // id أول أداة في أدواتي (القراءة بس، مفيش حاجة بتتغيّر).
  async function firstToolId() {
    const groups = (await (await myTools.listMyTools()).json()).data.tools as { instances: { id: number }[] }[];
    return groups[0].instances[0].id;
  }

  // ---------- لوحة التحكم ----------

  // الرد بيرجّع الكروت التلاتة وقايمة الأدوات وأكتر الأدوات والنشاط.
  test('dashboard returns the cards, tools, top tools and activity', { tag: '@smoke' }, async () => {
    const response = await statistics.dashboard();
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toBe(statisticsApi.dashboardKey);
    expect(body.data.stats.map((item: { key: string }) => item.key)).toEqual(statisticsApi.cardKeys);
    for (const item of body.data.stats) {
      expect(typeof item.value).toBe('number');
      expect(typeof item.change).toBe('number');
    }
    expect(Array.isArray(body.data.active_tools)).toBe(true);
    expect(Array.isArray(body.data.top_tools)).toBe(true);
    expect(body.data.activity.length).toBeGreaterThan(0);
  });

  // الأرقام جوه الرد متناسقة مع بعض.
  test('dashboard numbers are consistent with each other', { tag: '@regression' }, async () => {
    const data = (await (await statistics.dashboard()).json()).data;
    expect(data.stats[0].value).toBe(data.active_tools.length);
    // المتوقع: كل أداة تفاعلاتها = المرور + النقرات.
    for (const tool of [...data.active_tools, ...data.top_tools] as Tool[]) {
      expect(tool.interactions).toBe(tool.views + tool.clicks);
    }
    const top = (data.top_tools as Tool[]).map((tool) => tool.interactions);
    expect(top.length).toBeLessThanOrEqual(statisticsApi.topLimit);
    expect(top).toEqual([...top].sort((a, b) => b - a));
    const days = (data.activity as { interactions: number }[]).reduce((sum, day) => sum + day.interactions, 0);
    expect(data.activity_total).toBe(days);
  });

  // كارت "الأدوات المفعلة" بيساوي الأدوات المفعلة في أدواتي.
  test('active tools card equals the active tools of my tools', { tag: '@regression' }, async () => {
    const data = (await (await statistics.dashboard()).json()).data;
    const groups = (await (await myTools.listMyTools()).json()).data.tools as { instances: { status: string }[] }[];
    const active = groups.flatMap((group) => group.instances).filter((instance) => instance.status === 'active').length;
    expect(data.stats[0].value).toBe(active);
  });

  // فلتر التاريخ بيرجّع كل يوم في الفترة.
  test('date range returns one activity entry for every day', { tag: '@regression' }, async () => {
    const { from, to, days } = statisticsApi.oldRange;
    const response = await statistics.dashboard({ from, to });
    expect(response.status()).toBe(200);
    const data = (await response.json()).data;
    expect(data.activity).toHaveLength(days);
    expect(data.activity[0].date).toBe(from);
    expect(data.activity.at(-1).date).toBe(to);
    const sum = (data.activity as { interactions: number }[]).reduce((total, day) => total + day.interactions, 0);
    expect(data.activity_total).toBe(sum);
  });

  // فترة يوم واحد مقبولة.
  test('a one-day range is accepted', { tag: '@regression' }, async () => {
    const { from } = statisticsApi.oldRange;
    const response = await statistics.dashboard({ from, to: from });
    expect(response.status()).toBe(200);
    expect((await response.json()).data.activity).toHaveLength(1);
  });

  // الرسايل بتتغير حسب لغة الطلب.
  test('English language returns an English message', { tag: '@regression' }, async () => {
    // نطلب بالإنجليزي مع تاريخ غلط عشان نجيب رسالة.
    const response = await statistics.dashboard({ to: statisticsApi.oldRange.to }, 'en');
    expect(response.status()).toBe(422);
    expect((await response.json()).msg).not.toMatch(/[؀-ۿ]/);
  });

  // تستات التواريخ الغلط: كل فلتر لازم يتقفل بـ 422.
  for (const item of invalidDateFilters) {
    test(`dashboard rejects an invalid date filter: ${item.name}`, { tag: '@regression' }, async () => {
      const response = await statistics.dashboard(item.params);
      expect(response.status()).toBe(422);
      expect((await response.json()).msg).toBeTruthy();
    });
  }

  // ---------- أداة واحدة ----------

  // إحصائيات أداة بتاعتي: مرور ونقرات.
  test('tool statistics return views and clicks', { tag: '@smoke' }, async () => {
    const response = await statistics.tool(await firstToolId());
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toBe(statisticsApi.toolKey);
    expect(body.data.stats.map((item: { key: string }) => item.key)).toEqual(statisticsApi.toolCardKeys);
    for (const item of body.data.stats) expect(typeof item.value).toBe('number');
  });

  // فلتر التاريخ شغال على الأداة الواحدة.
  test('tool statistics accept a date range', { tag: '@regression' }, async () => {
    const response = await statistics.tool(await firstToolId(), { from: statisticsApi.oldRange.from, to: statisticsApi.oldRange.to });
    expect(response.status()).toBe(200);
  });

  // التواريخ الغلط بتترفض في إحصائيات الأداة كمان.
  for (const item of invalidDateFilters) {
    test(`tool statistics reject an invalid date filter: ${item.name}`, { tag: '@regression' }, async () => {
      const response = await statistics.tool(await firstToolId(), item.params);
      expect(response.status()).toBe(422);
    });
  }

  // أداة مش موجودة.
  test('tool statistics of an unknown tool return 404', { tag: '@regression' }, async () => {
    expect((await statistics.tool(unknownId)).status()).toBe(404);
  });

  // id مش رقم.
  test('tool statistics with a non-numeric id return 404', { tag: '@regression' }, async () => {
    expect((await statistics.tool(notNumericId)).status()).toBe(404);
  });

  // أداة بتاعة تاجر تاني (id 1) مرفوضة.
  test('tool statistics of another merchant tool return 403', { tag: '@critical' }, async () => {
    const response = await statistics.tool(1);
    expect(response.status()).toBe(403);
    expect((await response.json()).key).toBe(statisticsApi.notOwnedKey);
  });

  // ---------- التوكن ----------

  // من غير توكن: 401.
  test('statistics endpoints without token return 401', { tag: '@critical' }, async ({ request }) => {
    const noToken = new StatisticsClient(request, '');
    expect((await noToken.dashboard()).status()).toBe(401);
    expect((await noToken.tool(unknownId)).status()).toBe(401);
  });

  // توكن مزيّف: 401.
  test('statistics endpoints with a fake token return 401', { tag: '@regression' }, async ({ request }) => {
    const fake = new StatisticsClient(request, fakeJwt);
    expect((await fake.dashboard()).status()).toBe(401);
  });
});
