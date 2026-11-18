// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Object بتاع صفحة الأداة وأدوات الـ API المساعدة.
import { ToolBuilderPage } from '../pages/ToolBuilderPage';
import { createClients, addQaTool, deleteQaTools } from '../../scheduling/clients/qa-tools';
// نستورد بيانات التست.
import { apiUrl, paths, scheduleTexts } from '../../../test-data/test-data';

// تاب "الجدولة" جوه صفحة الأداة (/ar/my-tools/<slug>/<id>): نفس فكرة الجدولة بس من جوه الأداة نفسها.
// كل تست بيضيف أداة QA (الكوكيز) بالـ API ويحذفها بعد كده، وأدواتك الحقيقية مبتتلمسش.
test.describe('Tool page – schedule tab', () => {
  // التستات دي بتضيف أداة بالـ API، فبنتخطاها لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // الـ Page Object وعملاء الـ API وأداة QA اللي اتعملت للتست.
  let builder: ToolBuilderPage;
  let api: Awaited<ReturnType<typeof createClients>>;

  // قبل كل تست: نضيف أداة QA بالـ API ونفتح صفحتها وتاب "الجدولة".
  test.beforeEach(async ({ page, playwright }) => {
    api = await createClients(await playwright.request.newContext({ baseURL: apiUrl }));
    const tool = await addQaTool(api.myTools);
    builder = new ToolBuilderPage(page);
    await page.goto(`${paths.myTools}/cookies-consent/${tool.id}`, { waitUntil: 'domcontentloaded' });
    await builder.nameInput.waitFor();
    await page.getByRole('tab', { name: 'الجدولة', exact: true }).click();
  });

  // بعد كل تست: نحذف أي أداة QA فاضلة.
  test.afterEach(async () => {
    if (api) await deleteQaTools(api.myTools);
  });

  // التاب بيفتح والجدولة مقفولة.
  test('schedule tab opens with the schedule turned off', { tag: '@regression' }, async ({ page }) => {
    // المتوقع: قسم التاب ظاهر ومكتوب فيه إن الجدولة غير مفعّلة.
    const panel = page.getByRole('tabpanel', { name: 'الجدولة' });
    await expect(panel).toBeVisible();
    await expect(panel.getByText(scheduleTexts.switchOff)).toBeVisible();
    await expect(panel.getByRole('switch')).not.toBeChecked();
  });

  // تفعيل المفتاح بيظهر خانات التاريخ والوقت.
  test('turning the schedule on shows the date and time fields', { tag: '@regression' }, async ({ page }) => {
    // نفعّل المفتاح.
    const panel = page.getByRole('tabpanel', { name: 'الجدولة' });
    await panel.getByRole('switch').click();
    // المتوقع: عناوين الخانات الأربعة ظاهرة (بنبحث عن بداية النص لأن نفس الكلمات موجودة في رسايل التحقق).
    for (const label of [scheduleTexts.startDate, scheduleTexts.startTime, scheduleTexts.endDate, scheduleTexts.endTime]) {
      await expect(panel.getByText(new RegExp(`^${label}`))).toBeVisible();
    }
  });

  // خانة التاريخ بتفتح تقويم نختار منه يوم.
  test('start date field opens a calendar', { tag: '@regression' }, async ({ page }) => {
    // نفعّل المفتاح ونضغط على خانة تاريخ البداية.
    const panel = page.getByRole('tabpanel', { name: 'الجدولة' });
    await panel.getByRole('switch').click();
    const startDate = panel.locator('[data-slot="popover-trigger"]').first();
    await startDate.click();
    // المتوقع: التقويم اتفتح.
    await expect(startDate).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByRole('grid')).toBeVisible();
  });
});
