// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Objects وأدوات الـ API المساعدة.
import { SchedulingPage } from '../pages/SchedulingPage';
import { ScheduleModal } from '../pages/ScheduleModal';
import { createClients, addQaTool, deleteQaTools } from '../clients/qa-tools';
// نستورد بيانات التست.
import { apiUrl, scheduleTexts, scheduleBody, validSchedule } from '../../../test-data/test-data';

// تستات نافذة "اعدادات الجدولة" بتاعة أداة واحدة (بتتفتح بأيقونة الإعدادات في صف الأداة).
test.describe('Schedule settings popup', () => {
  // التستات دي بتضيف أداة بالـ API، فبنتخطاها لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // الـ Page Objects وعملاء الـ API والأداة اللي اتعملت للتست.
  let scheduling: SchedulingPage;
  let modal: ScheduleModal;
  let api: Awaited<ReturnType<typeof createClients>>;
  let tool: { id: number; name: string };

  // قبل كل تست: نضيف أداة QA بالـ API ونفتح صفحة الجدولة.
  test.beforeEach(async ({ page, playwright }) => {
    api = await createClients(await playwright.request.newContext({ baseURL: apiUrl }));
    tool = await addQaTool(api.myTools);
    scheduling = new SchedulingPage(page);
    modal = new ScheduleModal(page);
    await scheduling.open();
  });

  // بعد كل تست: نحذف أي أداة QA فاضلة.
  test.afterEach(async () => {
    if (api) await deleteQaTools(api.myTools);
  });

  // النافذة بتتفتح باسم الأداة والمفتاح مقفول وزراري الحفظ والإغلاق.
  test('popup shows the tool name, the switch off and both buttons', { tag: '@smoke' }, async () => {
    // نفتح النافذة.
    await scheduling.settingsButton(tool.name).click();
    // المتوقع: العنوان واسم الأداة ونص "غير مُفعَّلة" والزرارين ظاهرين.
    await expect(modal.dialog.getByText(scheduleTexts.popupTitle)).toBeVisible();
    await expect(modal.toolName(tool.name)).toBeVisible();
    await expect(modal.dialog.getByText(scheduleTexts.switchOff)).toBeVisible();
    await expect(modal.switch).not.toBeChecked();
    await expect(modal.saveButton).toBeVisible();
    await expect(modal.closeButton).toBeVisible();
  });

  // تفعيل المفتاح بيظهر خانات التاريخ والوقت.
  test('turning the switch on shows the date and time fields', { tag: '@regression' }, async () => {
    // نفتح النافذة ونفعّل المفتاح.
    await scheduling.settingsButton(tool.name).click();
    await modal.switch.click();
    // المتوقع: عناوين الخانات الأربعة ظاهرة.
    await expect(modal.dialog.getByText(scheduleTexts.startDate)).toBeVisible();
    await expect(modal.dialog.getByText(scheduleTexts.startTime)).toBeVisible();
    await expect(modal.dialog.getByText(scheduleTexts.endDate)).toBeVisible();
    await expect(modal.dialog.getByText(scheduleTexts.endTime)).toBeVisible();
  });

  // خانة التاريخ بتفتح تقويم نختار منه يوم.
  test('start date field opens a calendar', { tag: '@regression' }, async () => {
    // نفتح النافذة ونفعّل المفتاح ونضغط على خانة تاريخ البداية.
    await scheduling.settingsButton(tool.name).click();
    await modal.switch.click();
    await modal.startDate.click();
    // المتوقع: التقويم اتفتح (فيه أيام نقدر نختار منها).
    await expect(modal.startDate).toHaveAttribute('aria-expanded', 'true');
    await expect(scheduling.page.getByRole('grid')).toBeVisible();
  });

  // "إغلاق" بيقفل النافذة والأداة تفضل غير مجدولة.
  test('"إغلاق" closes the popup and keeps the tool unscheduled', { tag: '@regression' }, async () => {
    // نفتح النافذة ونفعّل المفتاح ونقفلها.
    await scheduling.settingsButton(tool.name).click();
    await modal.switch.click();
    await modal.closeButton.click();
    // المتوقع: النافذة اتقفلت والأداة لسه "غير مجدولة".
    await expect(modal.dialog).toBeHidden();
    await expect(scheduling.row(tool.name).getByText(scheduleTexts.notScheduled)).toBeVisible();
  });

  // الحفظ والمفتاح شغّال من غير تواريخ مرفوض ومبيجدولش الأداة.
  test('saving with the switch on and no dates is refused', { tag: '@regression' }, async () => {
    // نفتح النافذة ونفعّل المفتاح ونحفظ من غير ما نملا حاجة.
    await scheduling.settingsButton(tool.name).click();
    await modal.switch.click();
    await modal.saveButton.click();
    // المتوقع: رسالة التحقق بتاعة الواجهة ظاهرة، والأداة لسه "غير مجدولة" في الـ API.
    await expect(modal.dialog.getByText(scheduleTexts.requiredDates).first()).toBeVisible();
    const rows = (await (await api.scheduling.listSchedules()).json()).data.rows as { id: number; is_schedule: boolean }[];
    expect(rows.find((row) => row.id === tool.id)!.is_schedule).toBe(false);
  });

  // نافذة أداة مجدولة بتعرض التواريخ المحفوظة والمفتاح شغّال.
  test('popup of a scheduled tool shows the saved dates', { tag: '@regression' }, async () => {
    // نجدول الأداة بالـ API ونفتح الصفحة والنافذة.
    await api.scheduling.setSchedule(tool.id, scheduleBody());
    await scheduling.open();
    await scheduling.settingsButton(tool.name).click();
    // المتوقع: المفتاح شغّال والتواريخ المحفوظة ظاهرة.
    await expect(modal.switch).toBeChecked();
    await expect(modal.startDate).toContainText(validSchedule.startDate);
    await expect(modal.endDate).toContainText(validSchedule.endDate);
  });

  // إيقاف المفتاح بيفتح خطوة تأكيد، وتأكيدها بيلغي الجدولة.
  test('turning the switch off and confirming clears the schedule', { tag: '@smoke' }, async () => {
    // نجدول الأداة بالـ API ونفتح الصفحة والنافذة.
    await api.scheduling.setSchedule(tool.id, scheduleBody());
    await scheduling.open();
    await scheduling.settingsButton(tool.name).click();
    // نقفل المفتاح ونأكد.
    await modal.switch.click();
    await expect(modal.dialog.getByText(scheduleTexts.cancelTitle)).toBeVisible();
    await modal.confirmButton.click();
    // المتوقع: النافذة اتقفلت والصف بقى "غير مجدولة".
    await expect(modal.dialog).toBeHidden();
    await expect(scheduling.row(tool.name).getByText(scheduleTexts.notScheduled)).toBeVisible();
    // المتوقع: الـ API كمان بيقول إن الجدولة اتلغت.
    const rows = (await (await api.scheduling.listSchedules()).json()).data.rows as { id: number; is_schedule: boolean }[];
    expect(rows.find((row) => row.id === tool.id)!.is_schedule).toBe(false);
  });

  // "إغلاق" في خطوة التأكيد بيسيب الجدولة زي ما هي.
  test('"إغلاق" in the confirm step keeps the schedule', { tag: '@regression' }, async () => {
    // نجدول الأداة بالـ API ونفتح الصفحة والنافذة ونقفل المفتاح.
    await api.scheduling.setSchedule(tool.id, scheduleBody());
    await scheduling.open();
    await scheduling.settingsButton(tool.name).click();
    await modal.switch.click();
    // نضغط "إغلاق" بدل "تأكيد".
    await modal.closeButton.click();
    // المتوقع: النافذة اتقفلت والأداة لسه مجدولة.
    await expect(modal.dialog).toBeHidden();
    await expect(scheduling.row(tool.name).getByText(/مجدولة \(/)).toBeVisible();
  });
});
