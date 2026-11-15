// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Object.
import { MyToolsPage } from '../pages/MyToolsPage';
// نستورد بيانات التست.
import { paths } from '../../../test-data/test-data';

// صفحة "أدواتي" نفسها (SRS 10.9). التستات دي بتقرا الصفحة بس.
test.describe('My tools – page (SRS 10.9)', () => {
  // الـ Page Object، بيتعمل من جديد لكل تست.
  let myTools: MyToolsPage;

  // قبل كل تست: نفتح الصفحة.
  test.beforeEach(async ({ page }) => {
    myTools = new MyToolsPage(page);
    await myTools.open();
  });

  // الصفحة بتعرض العنوان والعدد وزرار الإضافة.
  test('page shows the title, the count and the add button', { tag: '@smoke' }, async () => {
    // المتوقع: العنوان و "N اداة مضافة" و "اضافة اداة".
    await expect(myTools.heading).toBeVisible();
    await expect(myTools.countText).toBeVisible();
    await expect(myTools.addToolButton).toBeVisible();
  });

  // العدد بيساوي عدد الأدوات في الجدول.
  test('count matches the number of tools in the table', { tag: '@regression' }, async () => {
    // كل أداة متضافة ليها زرار "حذف" واحد.
    expect(await myTools.addedCount()).toBe(await myTools.deleteButtons.count());
  });

  // كل صف أداة فيه شارة حالة ومفتاح وزرار حذف.
  test('every tool has a status, a switch and a delete button', { tag: '@regression' }, async () => {
    // نعدّ الأدوات.
    const total = await myTools.deleteButtons.count();
    // المتوقع: نفس العدد من الشارات والمفاتيح.
    // (الجدول فيه شارة مخفية كمان، فبنعدّ الشارات الظاهرة بس)
    expect(await myTools.rows.locator('[data-slot="badge"]').filter({ visible: true }).count()).toBe(total);
    expect(await myTools.rows.getByRole('switch').count()).toBe(total);
  });

  // "اضافة اداة" بتفتح الكتالوج.
  test('"اضافة اداة" opens the catalog', { tag: '@regression' }, async ({ page }) => {
    // نضغط الزرار.
    await myTools.addToolButton.click();
    // المتوقع: صفحة الكتالوج.
    await expect(page).toHaveURL(new RegExp(`${paths.tools}$`));
  });
});

// التحكم في الوصول.
test.describe('My tools – access (SRS 10.9)', () => {
  // الجزء ده بيشتغل من غير الجلسة المحفوظة (cookies فاضية = زائر مش عامل تسجيل دخول).
  test.use({ storageState: { cookies: [], origins: [] } });

  // الزائر اللي مش عامل تسجيل دخول مينفعش يفتح "أدواتي".
  test('my tools is not accessible without login', { tag: '@regression' }, async ({ page }) => {
    // نحاول نفتح الصفحة مباشرة.
    await page.goto(paths.myTools, { waitUntil: 'networkidle' });
    // المتوقع: تحويل لصفحة تسجيل الدخول، والصفحة هي عنوان الرجوع.
    await expect(page).toHaveURL(/\/auth\?.*callbackUrl=%2Far%2Fmy-tools/, { timeout: 30_000 });
  });
});
