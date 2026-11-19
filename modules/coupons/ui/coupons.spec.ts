import { test, expect } from '../../shared/bug-capture';
import { CouponsPage } from '../pages/CouponsPage';
import { createCouponsClient, addQaCoupon, deleteQaCoupons } from '../clients/qa-coupons';
import { apiUrl, paths, couponTexts } from '../../../test-data/test-data';

// تستات صفحة الكوبونات (القايمة). كل تست بيعمل كوبون QA بالـ API ويحذفه بعد كده، وكوبوناتك الحقيقية مبتتلمسش.
// بتشتغل في project اسمه "ui-merchant": التاجر بيبقى عامل تسجيل دخول جاهز.
test.describe('Coupons page – list', () => {
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

  // الصفحة بتعرض العنوان والعدد ووقت المزامنة وزرار الإضافة والبحث والفلاتر.
  test('page shows the title, the count, the sync time, the add button, the search box and the filters', { tag: '@smoke' }, async () => {
    await expect(couponsPage.heading).toBeVisible();
    await expect(couponsPage.countText).toBeVisible();
    await expect(couponsPage.syncText).toBeVisible();
    await expect(couponsPage.addButton).toBeVisible();
    await expect(couponsPage.searchInput).toBeVisible();
    await expect(couponsPage.sourceFilter).toBeVisible();
    await expect(couponsPage.statusFilter).toBeVisible();
  });

  // صف كوبون QA بيعرض كل بياناته وأزراره.
  test('coupon row shows its data and its buttons', { tag: '@smoke' }, async () => {
    const row = couponsPage.row(coupon.code);
    await expect(row).toBeVisible();
    await expect(row).toContainText(coupon.name);
    await expect(row).toContainText(couponTexts.sourceManual);
    await expect(row).toContainText(couponTexts.typePercentage);
    await expect(row).toContainText('10%');
    await expect(row).toContainText(new Date().toISOString().slice(0, 10));
    await expect(row).toContainText('2030-12-31');
    await expect(row).toContainText(couponTexts.statusActive);
    await expect(couponsPage.toggleLabel(coupon.code, couponTexts.stopLabel)).toBeVisible();
    await expect(couponsPage.copyButton(coupon.code)).toBeVisible();
    await expect(couponsPage.editButton(coupon.code)).toBeVisible();
    await expect(couponsPage.deleteButton(coupon.code)).toBeVisible();
  });

  // العدد المكتوب في الصفحة بيساوي عدد الكوبونات اللي الـ API بيرجّعها.
  test('count matches the number of coupons in the API', { tag: '@regression' }, async () => {
    const body = await (await api.list()).json();
    expect(await couponsPage.addedCount()).toBe(body.data.pagination.total);
  });

  // البحث باسم الكوبون بيلاقيه.
  test('search by the coupon name finds the coupon', { tag: '@regression' }, async () => {
    await couponsPage.search(coupon.name);
    await expect(couponsPage.row(coupon.code)).toBeVisible();
    await expect(couponsPage.rows).toHaveCount(1);
  });

  // البحث برمز الكوبون بيلاقيه.
  test('search by the coupon code finds the coupon', { tag: '@regression' }, async () => {
    await couponsPage.search(coupon.code);
    await expect(couponsPage.row(coupon.code)).toBeVisible();
    await expect(couponsPage.rows).toHaveCount(1);
  });

  // البحث بكلمة مش موجودة بيظهر شاشة "مفيش نتايج".
  test('search with a wrong word shows the empty state', { tag: '@regression' }, async () => {
    await couponsPage.search('zzzqqq');
    await expect(couponsPage.rows).toHaveCount(0);
    await expect(couponsPage.emptyTitle).toBeVisible();
    await expect(couponsPage.page.getByText(couponTexts.emptyHint)).toBeVisible();
  });

  // فلتر الحالة: "معطل" بيخفي الكوبون المفعّل، و "مفعل" بيظهره.
  test('status filter separates active and disabled coupons', { tag: '@regression' }, async () => {
    await couponsPage.choose(couponsPage.statusFilter, couponTexts.statusDisabled);
    await expect(couponsPage.row(coupon.code)).toHaveCount(0);
    await couponsPage.choose(couponsPage.statusFilter, couponTexts.statusActive);
    await expect(couponsPage.row(coupon.code)).toBeVisible();
  });

  // فلتر المصدر: "سلة" بيخفي الكوبون اللي اتعمل من Toolify.
  test('source filter hides a Toolify coupon when "سلة" is chosen', { tag: '@regression' }, async () => {
    await couponsPage.choose(couponsPage.sourceFilter, couponTexts.sourcePlatform);
    await expect(couponsPage.row(coupon.code)).toHaveCount(0);
  });

  // اختيارات فلتر الحالة مفيهاش اختيار مكرر.
  test('status filter options are not repeated', { tag: '@regression' }, async () => {
    await couponsPage.statusFilter.click();
    const options = await couponsPage.page.getByRole('option').allInnerTexts();
    expect(new Set(options).size).toBe(options.length);
  });

  // "العناصر في الصفحة" بتحدد عدد الصفوف.
  test('page size limits the number of rows', { tag: '@regression' }, async () => {
    await couponsPage.pageSize.selectOption('5');
    await expect(couponsPage.rows).toHaveCount(5);
  });

  // زرار النسخ بينسخ رمز الكوبون.
  test('copy button copies the coupon code', { tag: '@regression' }, async ({ context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await couponsPage.copyButton(coupon.code).click();
    await expect.poll(() => couponsPage.page.evaluate(() => navigator.clipboard.readText())).toBe(coupon.code);
  });
});

// التحكم في الوصول.
test.describe('Coupons page – access', () => {
  // الجزء ده بيشتغل من غير الجلسة المحفوظة (cookies فاضية = زائر مش عامل تسجيل دخول).
  test.use({ storageState: { cookies: [], origins: [] } });

  // الزائر اللي مش عامل تسجيل دخول مينفعش يفتح الكوبونات.
  test('coupons is not accessible without login', { tag: '@regression' }, async ({ page }) => {
    await page.goto(paths.coupons, { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/auth\?.*callbackUrl=%2Far%2Fcoupons/, { timeout: 30_000 });
  });
});
