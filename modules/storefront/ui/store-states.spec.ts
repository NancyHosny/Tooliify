// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد عميل ملف المتجر وأدوات QA المساعدة.
import { StoreClient } from '../../tools/clients/StoreClient';
import { createStoreClients, addMarkedCookiesTool, deleteQaTools } from '../clients/qa-store-tools';
import { sleep } from '../../dashboard/clients/rate-limit';
// نستورد بيانات التست.
import { apiUrl, validSchedule, scheduleBody, clearScheduleBody, storeWait } from '../../../test-data/test-data';

// حالة الأداة في "أدواتي" (موقوفة، مجدولة) لازم تنعكس على المتجر: الأداة المفعّلة بس هي اللي في ملف المتجر.
// كل تست بيضيف أداة كوكيز QA بالـ API (فيها قيمة مميزة في العنوان) ويحذفها بعد كده، وأدواتك الحقيقية مبتتلمسش.
test.describe('Storefront – tool state reaches the store file', () => {
  // ملف المتجر بيتحدّث بعد ثواني، وتست الجدولة بيستنى دقايق.
  test.describe.configure({ timeout: 300_000 });
  // التستات دي بتضيف أداة بالـ API، فبنتخطاها لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // عميل الملف، والعملاء، وأداة QA اللي اتعملت للتست.
  const file = new StoreClient();
  let clients: Awaited<ReturnType<typeof createStoreClients>>;
  let tool: { id: number; marker: string };

  // دالة بتستنى لحد ما القيمة المميزة تبقى موجودة (أو مش موجودة) في ملف المتجر.
  async function waitForFile(present: boolean) {
    await expect.poll(() => file.scriptHas(tool.marker), { timeout: storeWait.fileSeconds * 1000, intervals: [3_000] }).toBe(present);
  }

  // قبل كل تست: نضيف أداة QA ونتأكد إنها في ملف المتجر.
  test.beforeEach(async ({ playwright }) => {
    clients = await createStoreClients(await playwright.request.newContext({ baseURL: apiUrl }));
    tool = await addMarkedCookiesTool(clients.myTools);
    await waitForFile(true);
  });

  // بعد كل تست: نحذف أداة QA.
  test.afterEach(async () => {
    if (clients) await deleteQaTools(clients.myTools);
  });

  // إيقاف الأداة بيشيلها من المتجر.
  test('a stopped tool leaves the store file', { tag: '@smoke' }, async () => {
    // نوقف الأداة.
    await clients.myTools.toggleTool(tool.id);
    // المتوقع: القيمة اختفت من الملف.
    await waitForFile(false);
  });

  // تشغيلها تاني بيرجّعها.
  test('a tool that is started again comes back to the store file', { tag: '@regression' }, async () => {
    // نوقف الأداة ونستنى لحد ما تختفي، وبعدين نشغّلها.
    await clients.myTools.toggleTool(tool.id);
    await waitForFile(false);
    await clients.myTools.toggleTool(tool.id);
    // المتوقع: القيمة رجعت.
    await waitForFile(true);
  });

  // أداة مجدولة في المستقبل مش بتظهر في المتجر لسه.
  test('a tool scheduled for the future is not in the store file', { tag: '@regression' }, async () => {
    // نجدولها لسنة 2030.
    expect((await clients.scheduling.setSchedule(tool.id, scheduleBody(validSchedule))).status()).toBe(200);
    // المتوقع: القيمة اختفت من الملف.
    await waitForFile(false);
  });

  // إلغاء الجدولة بيرجّع الأداة للمتجر.
  test('cancelling the schedule brings the tool back to the store file', { tag: '@regression' }, async () => {
    // نجدولها للمستقبل ونستنى لحد ما تختفي، وبعدين نلغي الجدولة.
    await clients.scheduling.setSchedule(tool.id, scheduleBody(validSchedule));
    await waitForFile(false);
    expect((await clients.scheduling.setSchedule(tool.id, clearScheduleBody)).status()).toBe(200);
    // المتوقع: القيمة رجعت.
    await waitForFile(true);
  });

  // لما يبدأ ميعاد الجدولة الأداة لازم تظهر في المتجر (الـ API نفسه بيقول عنها "نشطة").
  test('a tool whose schedule has started is in the store file', { tag: '@regression' }, async () => {
    // نجدولها تبدأ بعد دقيقة وتخلص بعد 20 دقيقة (الأوقات بتتبعت بتوقيت UTC).
    const format = (ms: number) => new Date(Date.now() + ms).toISOString().slice(0, 16).replace('T', ' ');
    const response = await clients.scheduling.setSchedule(tool.id, { is_schedule: true, start_at: format(60_000), end_at: format(20 * 60_000) });
    expect(response.status()).toBe(200);
    // نستنى لحد ما ميعاد البداية يعدّي (مع هامش).
    await sleep(100_000);
    // المتوقع: الـ API بيقول إن الجدولة نشطة.
    const rows = (await (await clients.scheduling.listSchedules()).json()).data.rows as { id: number; schedule_status: string }[];
    expect(rows.find((row) => row.id === tool.id)?.schedule_status).toBe('active');
    // المتوقع: الأداة رجعت لملف المتجر.
    await waitForFile(true);
  });
});
