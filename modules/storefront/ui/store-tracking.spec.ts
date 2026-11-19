import { test, expect } from '../../shared/bug-capture';
import { StorePage } from '../../tools/pages/StorePage';
import { StoreClient } from '../../tools/clients/StoreClient';
import { createStoreClients, addMarkedCookiesTool } from '../clients/qa-store-tools';
import { deleteQaTools } from '../../shared/qa-tools';
import { sleep } from '../../dashboard/clients/rate-limit';
import { apiUrl, storeTexts, storeWait } from '../../../test-data/test-data';

// زائر المتجر بيعدّي بالماوس على الأداة وبيضغط عليها، وسكريبت Tooliify بيبعت الأرقام دي للسيرفر (POST /tracking/events)
// بعد حوالي 10 ثواني، وبتظهر في إحصائيات الأداة. بنضيف أداة كوكيز QA (بالـ API) ونحذفها في الآخر، وأدواتك الحقيقية مبتتلمسش.
test.describe('Storefront – visits and clicks are tracked', () => {
  // فتح المتجر وانتظار الإرسال بياخدوا وقت.
  // (التست الأخير بيعتمد على التستين اللي قبله، فبيشتغلوا ورا بعض.)
  test.describe.configure({ mode: 'serial', timeout: 180_000 });
  // التستات دي بتضيف أداة بالـ API، فبنتخطاها لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // العملاء وأداة QA.
  let clients: Awaited<ReturnType<typeof createStoreClients>>;
  let tool: { id: number; marker: string };

  // مرة واحدة قبل التستات: نضيف الأداة ونستنى لحد ما تظهر في ملف المتجر.
  test.beforeAll(async ({ playwright }) => {
    clients = await createStoreClients(await playwright.request.newContext({ baseURL: apiUrl }));
    tool = await addMarkedCookiesTool(clients.myTools);
    await expect.poll(() => new StoreClient().scriptHas(tool.marker), { timeout: storeWait.fileSeconds * 1000, intervals: [3_000] }).toBe(true);
  });

  // مرة واحدة بعد التستات: نحذف أداة QA.
  test.afterAll(async () => {
    if (clients) await deleteQaTools(clients.myTools);
  });

  // مرور الزائر على الأداة بالماوس بيتبعت للسيرفر (كمرور).
  // ملحوظة: فتح الصفحة لوحده مبيبعتش حاجة، المرور بيتسجّل لما الزائر يعدّي بالماوس على الأداة.
  // بنستنى رد السيرفر عشان التست ميقفلش الصفحة قبل ما الطلب يوصل.
  test('hovering over the tool sends a view', { tag: '@smoke' }, async ({ page }) => {
    await new StorePage(page).open();
    const answered = page.waitForResponse((response) => response.url().includes('/tracking/events') && (response.request().postData() ?? '').includes(`"merchant_tool_id":${tool.id}`), { timeout: storeWait.pageSeconds * 1000 });
    await page.getByRole('button', { name: storeTexts.accept }).first().hover();
    const response = await answered;
    expect(response.status()).toBe(202);
    expect(JSON.parse(response.request().postData()!).interactions[0].hovers).toBeGreaterThanOrEqual(1);
  });

  // نقرة الزائر على زرار الأداة بتتبعت للسيرفر.
  test('clicking the tool button sends a click', { tag: '@regression' }, async ({ page }) => {
    await new StorePage(page).open();
    const answered = page.waitForResponse((response) => response.url().includes('/tracking/events') && /"clicks":[1-9]/.test(response.request().postData() ?? '') && (response.request().postData() ?? '').includes(`"merchant_tool_id":${tool.id}`), { timeout: storeWait.pageSeconds * 1000 });
    await page.getByRole('button', { name: storeTexts.accept }).first().click();
    expect((await answered).status()).toBe(202);
  });

  // الأرقام اللي اتبعتت بتظهر في إحصائيات الأداة.
  test('the hover and the click appear in the tool statistics', { tag: '@regression' }, async () => {
    // الأرقام وصلت من التستين اللي فاتوا، فنسأل عنها كل 10 ثواني لحد دقيقتين.
    let values: Record<string, number> = {};
    for (let attempt = 0; attempt < 12; attempt++) {
      const stats = (await (await clients.statistics.toolFresh(tool.id, attempt)).json()).data.stats as { key: string; value: number }[];
      values = Object.fromEntries(stats.map((item) => [item.key, item.value]));
      if (values.views >= 1 && values.clicks >= 1) break;
      await sleep(10_000);
    }
    expect(values.views).toBeGreaterThanOrEqual(1);
    expect(values.clicks).toBeGreaterThanOrEqual(1);
  });
});
