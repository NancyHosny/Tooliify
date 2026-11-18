// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Objects وأدوات الـ API المساعدة.
import { CouponFormPage } from '../pages/CouponFormPage';
import { CouponsPage } from '../pages/CouponsPage';
import { createCouponsClient, addQaCoupon, deleteQaCoupons } from '../clients/qa-coupons';
// نستورد بيانات التست.
import { apiUrl, paths, couponTexts, couponBody, newQaCouponName, newQaCouponCode } from '../../../test-data/test-data';

// تستات نموذج الكوبون: إضافة كوبون جديد (/ar/coupons/new) وتعديل كوبون موجود (/ar/coupons/<id>).
// الكوبونات بتتعمل على متجرك الحقيقي (سلة)، فكل تست بيحذف كوبونات QA بتاعته بعد ما يخلص.
test.describe('Coupon form – new coupon', () => {
  // التستات دي بتتأكد من الكوبونات بالـ API، فبنتخطاها لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // الـ Page Objects وعميل الـ API.
  let form: CouponFormPage;
  let couponsPage: CouponsPage;
  let api: Awaited<ReturnType<typeof createCouponsClient>>;

  // قبل كل تست: نجهّز العميل ونفتح صفحة كوبون جديد.
  test.beforeEach(async ({ page, playwright }) => {
    api = await createCouponsClient(await playwright.request.newContext({ baseURL: apiUrl }));
    form = new CouponFormPage(page);
    couponsPage = new CouponsPage(page);
    await form.openNew();
  });

  // بعد كل تست: نحذف أي كوبون QA فاضل.
  test.afterEach(async () => {
    if (api) await deleteQaCoupons(api);
  });

  // نجيب الكوبونات اللي رمزها كذا من الـ API.
  async function couponsWithCode(code: string) {
    return (await (await api.list({ 'filter[search]': code })).json()).data.items as { id: number; name: string; coupon_code: string; type: string; discount_percentage: number }[];
  }

  // الصفحة بتفتح بالعنوان والخانات، وزرار الحفظ معطّل لحد ما النموذج يتملي.
  test('form shows the title and the fields, and save is disabled', { tag: '@smoke' }, async () => {
    // المتوقع: العنوان والخانات الأساسية ظاهرة.
    await expect(form.page.getByText(couponTexts.newTitle)).toBeVisible();
    await expect(form.nameInput).toBeVisible();
    await expect(form.codeInput).toBeVisible();
    await expect(form.generateButton).toBeVisible();
    await expect(form.discountInput).toBeVisible();
    await expect(form.startDate).toBeVisible();
    await expect(form.endDate).toBeVisible();
    // المتوقع: زرار الحفظ معطّل لأن النموذج فاضي.
    await expect(form.saveButton).toBeDisabled();
  });

  // زرار "توليد كود" بيكتب رمز جديد بادئته TFY-.
  test('"توليد كود" fills the code field', { tag: '@regression' }, async () => {
    // نضغط توليد كود.
    await form.generateButton.click();
    // المتوقع: الخانة فيها رمز بالشكل TFY- وحروف وأرقام.
    await expect(form.codeInput).toHaveValue(/^TFY-[A-Za-z0-9]+$/);
  });

  // كوبون نسبة مئوية صحيح بيتحفظ وبيظهر في القايمة "مجدول" (بيبدأ الشهر الجاي).
  test('valid percentage coupon is saved and listed', { tag: '@smoke' }, async () => {
    // نملا النموذج ونحفظ.
    const name = newQaCouponName();
    const code = newQaCouponCode();
    await form.fillValid(name, code);
    await form.saveButton.click();
    // المتوقع: رجعنا لقايمة الكوبونات والكوبون ظاهر "مجدول" بنسبة 15%.
    await expect(form.page).toHaveURL(new RegExp(`${paths.coupons}$`), { timeout: 60_000 });
    await expect(couponsPage.row(code)).toContainText(name);
    await expect(couponsPage.row(code)).toContainText(couponTexts.statusScheduled);
    await expect(couponsPage.row(code)).toContainText('15%');
    // المتوقع: الـ API كمان فيه الكوبون بنفس البيانات.
    const saved = (await couponsWithCode(code))[0];
    expect(saved.name).toBe(name);
    expect(saved.type).toBe('percentage');
    expect(saved.discount_percentage).toBe(15);
  });

  // كوبون مبلغ ثابت صحيح (الحد الأدنى للشراء أكبر من الخصم) بيتحفظ.
  test('valid fixed coupon is saved and listed', { tag: '@regression' }, async () => {
    // نختار "مبلغ ثابت" ونملا النموذج بخصم 20 وحد أدنى للشراء 100.
    const name = newQaCouponName();
    const code = newQaCouponCode();
    await form.choose(form.typeSelect, couponTexts.typeFixedOption);
    await form.fillValid(name, code, '20');
    await form.minPurchaseInput.fill('100');
    await form.saveButton.click();
    // المتوقع: رجعنا للقايمة والكوبون ظاهر "قيمة ثابتة".
    await expect(form.page).toHaveURL(new RegExp(`${paths.coupons}$`), { timeout: 60_000 });
    await expect(couponsPage.row(code)).toContainText(couponTexts.typeFixed);
    expect((await couponsWithCode(code))[0].type).toBe('fixed');
  });

  // اسم الكوبون مطلوب.
  test('empty name shows the required message', { tag: '@regression' }, async () => {
    // نكتب حرف ونمسحه.
    await form.nameInput.fill('Q');
    await form.nameInput.fill('');
    await form.nameInput.blur();
    // المتوقع: رسالة "اسم الكوبون مطلوب".
    await expect(form.page.getByText(couponTexts.nameRequired)).toBeVisible();
  });

  // نسبة الخصم لازم تبقى من 1 لـ 100، وأي قيمة أصغر من 1 غلط.
  for (const item of [
    { name: 'percentage above 100', value: '101', message: couponTexts.percentageRange },
    { name: 'discount is 0', value: '0', message: couponTexts.mustBePositive },
  ]) {
    test(`invalid discount shows its message: ${item.name}`, { tag: '@regression' }, async () => {
      // نكتب القيمة الغلط.
      await form.discountInput.fill(item.value);
      await form.discountInput.blur();
      // المتوقع: الرسالة المناسبة.
      await expect(form.page.getByText(item.message)).toBeVisible();
    });
  }

  // اسم من حرف واحد مرفوض (الحد الأدنى حرفين) والكوبون مبيتحفظش.
  test('coupon with a one character name is not saved', { tag: '@regression' }, async () => {
    // نملا النموذج باسم من حرف واحد ونحاول نحفظ.
    const code = newQaCouponCode();
    await form.fillValid('Q', code);
    await form.saveButton.click();
    // المتوقع: لسه في صفحة كوبون جديد ومفيش كوبون اتعمل.
    await expect(form.page).toHaveURL(new RegExp(`${paths.newCoupon}$`));
    expect(await couponsWithCode(code)).toHaveLength(0);
  });

  // رمز كوبون موجود قبل كده مرفوض.
  test('coupon with a code that already exists is not saved', { tag: '@regression' }, async () => {
    // نعمل كوبون بالـ API ونحاول نعمل كوبون تاني بنفس الرمز من النموذج.
    const existing = await addQaCoupon(api);
    await form.fillValid(newQaCouponName(), existing.code);
    await form.saveButton.click();
    // المتوقع: لسه في صفحة كوبون جديد ومفيش غير كوبون واحد بالرمز ده.
    await expect(form.page).toHaveURL(new RegExp(`${paths.newCoupon}$`));
    expect(await couponsWithCode(existing.code)).toHaveLength(1);
  });

  // مبلغ ثابت أكبر من أقل مبلغ شراء مرفوض.
  test('fixed coupon with a discount above the minimum purchase is not saved', { tag: '@regression' }, async () => {
    // نختار "مبلغ ثابت" بخصم 20 وأقل مبلغ شراء 1 (الافتراضي) ونحاول نحفظ.
    const code = newQaCouponCode();
    await form.choose(form.typeSelect, couponTexts.typeFixedOption);
    await form.fillValid(newQaCouponName(), code, '20');
    await form.saveButton.click();
    // المتوقع: لسه في صفحة كوبون جديد ومفيش كوبون اتعمل.
    await expect(form.page).toHaveURL(new RegExp(`${paths.newCoupon}$`));
    expect(await couponsWithCode(code)).toHaveLength(0);
  });

  // التقويم مبيسمحش باختيار تاريخ نهاية قبل تاريخ البداية.
  test('end date calendar does not allow a day before the start date', { tag: '@regression' }, async () => {
    // نختار بداية يوم 20 الشهر الجاي.
    await form.pickDate(form.startDate, 20);
    // نفتح تقويم النهاية وننتقل للشهر الجاي.
    await form.endDate.click();
    await form.page.getByRole('button', { name: couponTexts.nextMonth }).last().click();
    // المتوقع: يوم 10 (قبل البداية) معطّل، ويوم 25 (بعد البداية) متاح.
    await expect(form.page.locator('td[role="gridcell"] button', { hasText: /^10$/ }).last()).toBeDisabled();
    await expect(form.page.locator('td[role="gridcell"] button', { hasText: /^25$/ }).last()).toBeEnabled();
  });
});

// تعديل كوبون موجود.
test.describe('Coupon form – edit coupon', () => {
  // التستات دي بتعمل كوبون بالـ API، فبنتخطاها لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // الـ Page Objects وعميل الـ API وكوبون QA اللي اتعمل للتست.
  let form: CouponFormPage;
  let couponsPage: CouponsPage;
  let api: Awaited<ReturnType<typeof createCouponsClient>>;
  let coupon: { id: number; name: string; code: string };

  // قبل كل تست: نعمل كوبون QA بالـ API ونفتح صفحة تعديله.
  test.beforeEach(async ({ page, playwright }) => {
    api = await createCouponsClient(await playwright.request.newContext({ baseURL: apiUrl }));
    coupon = await addQaCoupon(api, couponBody());
    form = new CouponFormPage(page);
    couponsPage = new CouponsPage(page);
    await form.openEdit(coupon.id);
  });

  // بعد كل تست: نحذف أي كوبون QA فاضل.
  test.afterEach(async () => {
    if (api) await deleteQaCoupons(api);
  });

  // صفحة التعديل بتفتح بالبيانات المحفوظة.
  test('edit page shows the saved values', { tag: '@regression' }, async () => {
    // المتوقع: العنوان باسم الكوبون والخانات فيها قيم الكوبون.
    await expect(form.page.getByText(`${couponTexts.editTitle} ${coupon.name}`)).toBeVisible();
    await expect(form.nameInput).toHaveValue(coupon.name);
    await expect(form.codeInput).toHaveValue(coupon.code);
    await expect(form.discountInput).toHaveValue('10');
    await expect(form.endDate).toContainText('2030-12-31');
  });

  // الاسم الجديد بيتحفظ وبيظهر في القايمة.
  test('renaming the coupon saves the new name', { tag: '@smoke' }, async () => {
    // نكتب اسم جديد ونحفظ.
    const newName = `${coupon.name}-edited`;
    await form.nameInput.fill(newName);
    await form.saveButton.click();
    // المتوقع: رجعنا للقايمة والصف عليه الاسم الجديد.
    await expect(form.page).toHaveURL(new RegExp(`${paths.coupons}$`), { timeout: 60_000 });
    await expect(couponsPage.row(coupon.code)).toContainText(newName);
    // المتوقع: الـ API كمان بيرجّع الاسم الجديد.
    expect((await (await api.get(coupon.id)).json()).data.name).toBe(newName);
  });

  // مسح الاسم بيظهر رسالة "اسم الكوبون مطلوب".
  test('empty name shows the required message', { tag: '@regression' }, async () => {
    // نمسح الاسم.
    await form.nameInput.fill('');
    await form.nameInput.blur();
    // المتوقع: الرسالة ظاهرة وزرار الحفظ معطّل.
    await expect(form.page.getByText(couponTexts.nameRequired)).toBeVisible();
    await expect(form.saveButton).toBeDisabled();
  });

  // نسبة الخصم فوق 100 مرفوضة في التعديل كمان.
  test('percentage above 100 shows its message', { tag: '@regression' }, async () => {
    // نكتب 101.
    await form.discountInput.fill('101');
    await form.discountInput.blur();
    // المتوقع: الرسالة ظاهرة.
    await expect(form.page.getByText(couponTexts.percentageRange)).toBeVisible();
  });
});
