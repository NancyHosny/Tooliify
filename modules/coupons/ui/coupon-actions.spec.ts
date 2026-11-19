import { test, expect } from '../../shared/bug-capture';
import { CouponsPage } from '../pages/CouponsPage';
import { createCouponsClient, addQaCoupon, deleteQaCoupons } from '../clients/qa-coupons';
import { apiUrl, couponTexts, scheduledCouponBody } from '../../../test-data/test-data';

// تستات إجراءات الصف في صفحة الكوبونات: إيقاف وتفعيل الكوبون، وحذفه (كل واحد بنافذة تأكيد).
// كل تست بيعمل كوبون QA بالـ API ويحذفه بعد كده، وكوبوناتك الحقيقية مبتتلمسش.
test.describe('Coupon row actions', () => {
  // التستات دي بتعمل كوبون بالـ API، فبنتخطاها لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // الـ Page Object وعميل الـ API وكوبون QA اللي اتعمل للتست.
  let couponsPage: CouponsPage;
  let api: Awaited<ReturnType<typeof createCouponsClient>>;
  let coupon: { id: number; name: string; code: string };

  // قبل كل تست: نعمل كوبون QA مفعّل بالـ API ونفتح صفحة الكوبونات.
  test.beforeEach(async ({ page, playwright }) => {
    api = await createCouponsClient(await playwright.request.newContext({ baseURL: apiUrl }));
    coupon = await addQaCoupon(api);
    couponsPage = new CouponsPage(page);
    await couponsPage.open();
  });

  // بعد كل تست: نحذف أي كوبون QA فاضل.
  test.afterEach(async () => {
    if (api) await deleteQaCoupons(api);
  });

  // ---------- إيقاف الكوبون ----------

  // "ايقاف" بيفتح نافذة تأكيد فيها رمز الكوبون وسؤال وزراري التأكيد والإغلاق.
  test('stop popup shows the coupon code, the question and both buttons', { tag: '@regression' }, async () => {
    await couponsPage.toggleLabel(coupon.code, couponTexts.stopLabel).click();
    await expect(couponsPage.dialog.getByText(couponTexts.stopTitle)).toBeVisible();
    await expect(couponsPage.dialog.getByText(coupon.code)).toBeVisible();
    await expect(couponsPage.dialog.getByText(couponTexts.stopQuestion)).toBeVisible();
    await expect(couponsPage.dialog.getByRole('button', { name: couponTexts.confirm })).toBeVisible();
    await expect(couponsPage.dialog.getByRole('button', { name: couponTexts.close })).toBeVisible();
  });

  // "إغلاق" في نافذة الإيقاف بيسيب الكوبون مفعّل.
  test('"إغلاق" in the stop popup keeps the coupon active', { tag: '@regression' }, async () => {
    await couponsPage.toggleLabel(coupon.code, couponTexts.stopLabel).click();
    await couponsPage.dialog.getByRole('button', { name: couponTexts.close }).click();
    await expect(couponsPage.dialog).toBeHidden();
    await expect(couponsPage.row(coupon.code)).toContainText(couponTexts.statusActive);
  });

  // تأكيد الإيقاف بيخلي الكوبون "معطل" ويظهر "تفعيل".
  test('confirming the stop disables the coupon', { tag: '@smoke' }, async () => {
    await couponsPage.toggleLabel(coupon.code, couponTexts.stopLabel).click();
    await couponsPage.dialog.getByRole('button', { name: couponTexts.confirm }).click();
    await expect(couponsPage.dialog).toBeHidden();
    await expect(couponsPage.row(coupon.code)).toContainText(couponTexts.statusDisabled);
    await expect(couponsPage.toggleLabel(coupon.code, couponTexts.activateLabel)).toBeVisible();
    expect((await (await api.get(coupon.id)).json()).data.status).toBe('disabled');
  });

  // الكوبون المعطل بيتفعّل تاني.
  test('a disabled coupon can be activated again', { tag: '@regression' }, async () => {
    await api.setStatus(coupon.id, { status: 'disabled' });
    await couponsPage.open();
    await couponsPage.toggleLabel(coupon.code, couponTexts.activateLabel).click();
    const confirm = couponsPage.dialog.getByRole('button', { name: couponTexts.confirm });
    if (await confirm.isVisible({ timeout: 3000 }).catch(() => false)) await confirm.click();
    await expect(couponsPage.row(coupon.code)).toContainText(couponTexts.statusActive);
    await expect(couponsPage.toggleLabel(coupon.code, couponTexts.stopLabel)).toBeVisible();
  });

  // الكوبون اللي لسه مبدأش بيظهر "مجدول".
  test('a coupon that has not started yet is shown as scheduled', { tag: '@regression' }, async () => {
    const scheduled = await addQaCoupon(api, scheduledCouponBody());
    await couponsPage.open();
    await expect(couponsPage.row(scheduled.code)).toContainText(couponTexts.statusScheduled);
  });

  // ---------- حذف الكوبون ----------

  // "حذف" بيفتح نافذة فيها رمز الكوبون وتحذير وزراري الحذف والإغلاق.
  test('delete popup shows the coupon code, the warning and both buttons', { tag: '@regression' }, async () => {
    await couponsPage.deleteButton(coupon.code).click();
    await expect(couponsPage.dialog.getByText(couponTexts.deleteTitle).first()).toBeVisible();
    await expect(couponsPage.dialog.getByText(coupon.code)).toBeVisible();
    await expect(couponsPage.dialog.getByText(couponTexts.deleteQuestion)).toBeVisible();
    await expect(couponsPage.dialog.getByRole('button', { name: couponTexts.deleteConfirm, exact: true })).toBeVisible();
    await expect(couponsPage.dialog.getByRole('button', { name: couponTexts.close })).toBeVisible();
  });

  // "إغلاق" في نافذة الحذف بيسيب الكوبون.
  test('"إغلاق" in the delete popup keeps the coupon', { tag: '@regression' }, async () => {
    await couponsPage.deleteButton(coupon.code).click();
    await couponsPage.dialog.getByRole('button', { name: couponTexts.close }).click();
    await expect(couponsPage.dialog).toBeHidden();
    await expect(couponsPage.row(coupon.code)).toBeVisible();
    await couponsPage.open();
    await expect(couponsPage.row(coupon.code)).toBeVisible();
  });

  // تأكيد الحذف بيشيل الكوبون من القايمة ومن الـ API.
  test('confirming the delete removes the coupon', { tag: '@smoke' }, async () => {
    await couponsPage.deleteButton(coupon.code).click();
    await couponsPage.dialog.getByRole('button', { name: couponTexts.deleteConfirm, exact: true }).click();
    await expect(couponsPage.dialog).toBeHidden({ timeout: 30_000 });
    await expect(couponsPage.row(coupon.code)).toHaveCount(0);
    expect((await api.get(coupon.id)).status()).toBe(404);
  });
});
