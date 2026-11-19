import { test, expect } from '../../shared/bug-capture';
import { DashboardPage } from '../pages/DashboardPage';
import { StatisticsClient } from '../clients/StatisticsClient';
import { sleep } from '../clients/rate-limit';
import { createClients, addQaTool } from '../../scheduling/clients/qa-tools';
import { deleteQaTools } from '../../shared/qa-tools';
import { getMerchantToken } from '../../shared/merchant-token';
import { apiUrl, dashboardTexts, trackBody, statisticsApi } from '../../../test-data/test-data';

// أرقام بنسجّلها لأداة QA: 3 نقرات و5 مرور = 8 تفاعلات.
const clicks = 3;
const views = 5;

// بنثبت إن التفاعلات اللي المتجر بيسجّلها بتوصل للوحة التحكم.
// بنضيف أداة QA بالـ API ونسجّل عليها تفاعلات، وبعدين نقارن الأرقام في الـ API وفي الشاشة. الأداة بتتحذف في الآخر.
// ملحوظة: كروت الأدوات و"أكثر الأدوات تفاعلًا" بتتأخر عن الإجمالي حوالي 5 دقايق (السيرفر بيحفظ أرقامها مؤقتًا)، فالتستات بتستنى.
test.describe('Dashboard – tracked tool data', () => {
  // التستات ورا بعض (كل تست بيعتمد على اللي قبله) ووقتها طويل بسبب الانتظار.
  test.describe.configure({ mode: 'serial', timeout: 600_000 });
  // التستات دي بتضيف أداة بالـ API، فبنتخطاها لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // عميل الإحصائيات وأداة QA اللي اتعملت.
  let statistics: StatisticsClient;
  let myTools: Awaited<ReturnType<typeof createClients>>['myTools'];
  let tool: { id: number; name: string };

  // مرة واحدة قبل التستات: نضيف أداة QA ونسجّل عليها نقرات ومرور.
  test.beforeAll(async ({ playwright }) => {
    const request = await playwright.request.newContext({ baseURL: apiUrl });
    const api = await createClients(request);
    myTools = api.myTools;
    statistics = new StatisticsClient(request, await getMerchantToken(request));
    tool = await addQaTool(myTools);
    const response = await statistics.track(trackBody(tool.id, clicks, views));
    expect(response.status()).toBe(202);
  });

  // مرة واحدة بعد التستات: نحذف أداة QA.
  test.afterAll(async () => {
    if (myTools) await deleteQaTools(myTools);
  });

  // إحصائيات الأداة الواحدة بتتحدّث بعد ثواني.
  test('tracked clicks and visits reach the tool statistics', { tag: '@regression' }, async () => {
    // نستنى شوية عشان السيرفر يعالج التفاعلات (من غير ما نسأل قبل كده عشان الرد ما يتحفظش فاضي).
    await sleep(10_000);
    let values: Record<string, number> = {};
    for (let attempt = 0; attempt < 12; attempt++) {
      const body = await (await statistics.tool(tool.id)).json();
      values = Object.fromEntries(body.data.stats.map((item: { key: string; value: number }) => [item.key, item.value]));
      if (values.clicks === clicks) break;
      await sleep(10_000);
    }
    expect(values.clicks).toBe(clicks);
    expect(values.views).toBe(views);
  });

  // لوحة التحكم (الـ API) بتجيب الأداة بأرقامها في الكروت وفي "أكثر الأدوات تفاعلًا" بعد ما السيرفر يحدّث المخزّن المؤقت.
  test('tracked numbers reach the dashboard cards and the top list', { tag: '@regression' }, async () => {
    let data: { stats: { key: string; value: number }[]; active_tools: { merchant_tool_id: number; clicks: number; views: number }[]; top_tools: { merchant_tool_id: number; interactions: number }[]; activity: { interactions: number }[] } | undefined;
    for (let attempt = 0; attempt < 36; attempt++) {
      data = (await (await statistics.dashboard()).json()).data;
      if (data!.active_tools.find((item) => item.merchant_tool_id === tool.id)?.clicks === clicks) break;
      await sleep(10_000);
    }
    const card = data!.active_tools.find((item) => item.merchant_tool_id === tool.id)!;
    expect(card.clicks).toBe(clicks);
    expect(card.views).toBe(views);
    expect(data!.top_tools.find((item) => item.merchant_tool_id === tool.id)?.interactions).toBe(clicks + views);
    const totals = Object.fromEntries(data!.stats.map((item) => [item.key, item.value]));
    expect(totals.clicks).toBeGreaterThanOrEqual(clicks);
    expect(totals.views).toBeGreaterThanOrEqual(views);
    expect(data!.activity.at(-1)!.interactions).toBeGreaterThanOrEqual(clicks + views);
  });

  // الشاشة بتعرض نفس الأرقام.
  test('dashboard page shows the tracked numbers of the tool', { tag: '@smoke' }, async ({ page }) => {
    const dashboard = new DashboardPage(page);
    const { statistics: data } = await dashboard.open();
    expect(data.active_tools.find((item) => item.merchant_tool_id === tool.id)?.clicks).toBe(clicks);
    await expect(dashboard.toolCard(tool.name)).toContainText(new RegExp(`${clicks}\s*${dashboardTexts.clicks}\s*${views}\s*${dashboardTexts.views}`));
    const rank = data.top_tools.findIndex((item) => item.merchant_tool_id === tool.id) + 1;
    expect(rank).toBeGreaterThan(0);
    expect(rank).toBeLessThanOrEqual(statisticsApi.topLimit);
    await expect(dashboard.topItem(rank)).toContainText(tool.name);
    await expect(dashboard.topItem(rank)).toContainText(new RegExp(`${clicks + views}\s*${dashboardTexts.interaction}`));
  });
});
