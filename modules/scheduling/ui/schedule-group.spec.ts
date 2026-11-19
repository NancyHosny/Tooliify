import { test, expect } from '../../shared/bug-capture';
import { SchedulingPage } from '../pages/SchedulingPage';
import { createClients, addQaTool } from '../clients/qa-tools';
import { deleteQaTools } from '../../shared/qa-tools';
import { apiUrl } from '../../../test-data/test-data';

// تستات لوحة "جدولة مجموعة": بنختار أدوات ونحدد فترة واحدة لكلهم (اللوحة بتفتح جنب الجدول).
test.describe('Group schedule panel', () => {
  // التستات دي بتضيف أداة بالـ API، فبنتخطاها لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // الـ Page Object وعملاء الـ API والأداة اللي اتعملت للتست.
  let scheduling: SchedulingPage;
  let api: Awaited<ReturnType<typeof createClients>>;
  let tool: { id: number; name: string };

  // قبل كل تست: نضيف أداة QA بالـ API ونفتح صفحة الجدولة ولوحة المجموعة.
  test.beforeEach(async ({ page, playwright }) => {
    api = await createClients(await playwright.request.newContext({ baseURL: apiUrl }));
    tool = await addQaTool(api.myTools);
    scheduling = new SchedulingPage(page);
    await scheduling.open();
    await scheduling.groupButton.click();
  });

  // بعد كل تست: نحذف أي أداة QA فاضلة.
  test.afterEach(async () => {
    if (api) await deleteQaTools(api.myTools);
  });

  // اللوحة بتتفتح بالعنوان وقسم الأدوات المختارة والخانات الأربعة، وزرار الإرسال معطّل.
  test('panel shows the title, the selected tools, the fields and a disabled submit button', { tag: '@smoke' }, async () => {
    await expect(scheduling.groupSelected).toBeVisible();
    await expect(scheduling.groupStartDate).toBeVisible();
    await expect(scheduling.groupEndDate).toBeVisible();
    await expect(scheduling.groupStartTime).toBeVisible();
    await expect(scheduling.groupEndTime).toBeVisible();
    // المتوقع: زرار الإرسال عليه (0) ومعطّل لأن مفيش أداة مختارة.
    await expect(scheduling.groupSubmit).toContainText('(0)');
    await expect(scheduling.groupSubmit).toBeDisabled();
  });

  // اختيار أداة بيزوّد العدد في الزرار وبيفعّله.
  test('ticking a tool selects it', { tag: '@regression' }, async () => {
    await scheduling.rowCheckbox(tool.name).click();
    await expect(scheduling.groupSubmit).toContainText('(1)');
    await expect(scheduling.groupSubmit).toBeEnabled();
  });

  // إلغاء اختيار الأداة بيرجّع العدد لصفر.
  test('unticking a tool unselects it', { tag: '@regression' }, async () => {
    await scheduling.rowCheckbox(tool.name).click();
    await scheduling.rowCheckbox(tool.name).click();
    await expect(scheduling.groupSubmit).toContainText('(0)');
  });

  // "تحديد كل الأدوات" بيختار كل الصفوف.
  test('"تحديد كل الأدوات" selects every tool', { tag: '@regression' }, async () => {
    const total = await scheduling.rows.count();
    await scheduling.selectAll.click();
    await expect(scheduling.groupSubmit).toContainText(`(${total})`);
  });

  // زرار الإغلاق بيقفل اللوحة.
  test('closing the panel hides it', { tag: '@regression' }, async () => {
    await scheduling.groupCloseButton.click();
    await expect(scheduling.groupSelected).toBeHidden();
  });

  // اختيار يوم من التقويم بيكتبه في الخانة بالشكل YYYY-MM-DD.
  test('picking a day from the calendar fills the date field', { tag: '@regression' }, async () => {
    await scheduling.pickDate(scheduling.groupStartDate, 15);
    await expect(scheduling.groupStartDate).toHaveText(/^\d{4}-\d{2}-15$/);
  });

  // جدولة صحيحة لأداة مختارة بتتحفظ وبتظهر "مجدولة" (التواريخ في الشهر الجاي).
  test('valid group schedule saves and the tool shows as scheduled', { tag: '@smoke' }, async () => {
    await scheduling.rowCheckbox(tool.name).click();
    await scheduling.pickDate(scheduling.groupStartDate, 10);
    await scheduling.groupStartTime.fill('10:00');
    await scheduling.pickDate(scheduling.groupEndDate, 20);
    await scheduling.groupEndTime.fill('12:00');
    await scheduling.groupSubmit.click();
    await expect(scheduling.row(tool.name).getByText(/مجدولة \(/)).toBeVisible();
    const rows = (await (await api.scheduling.listSchedules()).json()).data.rows as { id: number; is_schedule: boolean }[];
    expect(rows.find((row) => row.id === tool.id)!.is_schedule).toBe(true);
  });
});
