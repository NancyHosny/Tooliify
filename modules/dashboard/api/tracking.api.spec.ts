// نستورد test و expect من Playwright (الـ fixture اسمه "request" هو اللي بيبعت طلبات الـ API).
import { test, expect } from '../../shared/bug-capture';
// نستورد عميل الإحصائيات وأدوات QA المساعدة.
import { StatisticsClient } from '../clients/StatisticsClient';
import { createClients, addQaTool, deleteQaTools } from '../../scheduling/clients/qa-tools';
import { getMerchantToken } from '../../shared/merchant-token';
// نستورد بيانات التست.
import { apiUrl, unknownId, statisticsApi, trackBody, invalidTrackBodies } from '../../../test-data/test-data';

// تستات API لتسجيل التفاعلات (POST /tracking/events): المتجر بيبعت منه نقرات ومرور كل أداة، ومبيحتاجش توكن.
// كل التسجيلات الصحيحة بتتعمل على أداة QA بتتحذف بعد التست.
test.describe('Tracking – API', () => {
  // نتخطى كل التستات لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // العميل وأداة QA اللي اتعملت للتست.
  let statistics: StatisticsClient;
  let api: Awaited<ReturnType<typeof createClients>>;
  let tool: { id: number; name: string };

  // مرة واحدة قبل التستات: نضيف أداة QA (كل التسجيلات الصحيحة بتتعمل عليها).
  test.beforeAll(async ({ playwright }) => {
    const request = await playwright.request.newContext({ baseURL: apiUrl });
    api = await createClients(request);
    statistics = new StatisticsClient(request, await getMerchantToken(request));
    tool = await addQaTool(api.myTools);
  });

  // مرة واحدة بعد التستات: نحذف أدوات QA.
  test.afterAll(async () => {
    if (api) await deleteQaTools(api.myTools);
  });

  // تسجيل نقرات ومرور من غير توكن بيتقبل.
  test('valid interactions are accepted without a token', { tag: '@smoke' }, async () => {
    // نبعت 3 نقرات و5 مرور.
    const response = await statistics.track(trackBody(tool.id));
    // المتوقع: 202 (اتقبلت للمعالجة) ومفتاح النجاح.
    expect(response.status()).toBe(202);
    expect((await response.json()).key).toBe(statisticsApi.trackedKey);
  });

  // وقت التفاعل الحالي مقبول.
  test('an interaction with the current time is accepted', { tag: '@regression' }, async () => {
    // نبعت تفاعل وقته دلوقتي.
    const response = await statistics.track(trackBody(tool.id, 1, 1, new Date().toISOString()));
    // المتوقع: 202.
    expect(response.status()).toBe(202);
  });

  // أكتر من تفاعل في طلب واحد.
  test('several interactions in one request are accepted', { tag: '@regression' }, async () => {
    // نبعت تفاعلين في طلب واحد.
    const interactions = [trackBody(tool.id, 1, 0).interactions[0], trackBody(tool.id, 0, 1).interactions[0]];
    const response = await statistics.track({ interactions });
    // المتوقع: 202.
    expect(response.status()).toBe(202);
  });

  // أداة مش موجودة.
  test('interactions of an unknown tool return 404', { tag: '@regression' }, async () => {
    // المتوقع: 404.
    expect((await statistics.track(trackBody(unknownId))).status()).toBe(404);
  });

  // تست لكل جسم غلط: لازم 422.
  for (const item of invalidTrackBodies) {
    test(`invalid interactions are rejected: ${item.name}`, { tag: '@regression' }, async () => {
      // نبعت الجسم الغلط.
      const response = await statistics.track(item.body);
      // المتوقع: 422 ورسالة.
      expect(response.status()).toBe(422);
      expect((await response.json()).msg).toBeTruthy();
    });
  }
});
