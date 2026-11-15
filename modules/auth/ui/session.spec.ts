// نستورد test و expect من Playwright.
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Objects.
import { LoginPage } from '../pages/LoginPage';
import { AccountMenu } from '../pages/AccountMenu';
// نستورد بيانات التست.
import { validMerchant, paths } from '../../../test-data/test-data';

// تسجيل الخروج والتحكم في الوصول (SRS 10.6 و 10.16).
test.describe('Authentication – Session & logout (SRS 10.6, 10.16)', () => {
  // الـ Page Objects، بتتعمل من جديد لكل تست.
  let loginPage: LoginPage;
  let accountMenu: AccountMenu;

  // قبل كل تست: نعمل الـ Page Objects.
  test.beforeEach(async ({ page }) => {
    // نعمل الـ Page Objects لتاب التست ده.
    loginPage = new LoginPage(page);
    accountMenu = new AccountMenu(page);
  });

  // تسجيل الخروج بالتأكيد بينهي الجلسة.
  test('logout ends the session', { tag: '@smoke' }, async ({ page }) => {
    // نفتح صفحة الدخول ونسجّل.
    await loginPage.open();
    await loginPage.login(validMerchant.email, validMerchant.password);
    // نستنى لحد ما نبقى جوه لوحة التحكم.
    await expect(page).not.toHaveURL(/\/auth/);
    // نضغط "تسجيل الخروج".
    await accountMenu.clickLogout();
    // المتوقع: نافذة التأكيد ظاهرة.
    await expect(accountMenu.confirmText).toBeVisible();
    // نأكد الخروج.
    await accountMenu.confirmButton.click();
    // المتوقع: رجعنا لصفحة الدخول.
    await expect(page).toHaveURL(/\/auth/);
  });

  // "إلغاء" في نافذة الخروج بيسيب التاجر مسجّل دخول.
  test('cancel logout keeps the session', { tag: '@regression' }, async ({ page }) => {
    // نفتح صفحة الدخول ونسجّل.
    await loginPage.open();
    await loginPage.login(validMerchant.email, validMerchant.password);
    // نستنى لحد ما نبقى جوه لوحة التحكم.
    await expect(page).not.toHaveURL(/\/auth/);
    // نفتح نافذة الخروج.
    await accountMenu.clickLogout();
    // نضغط "إلغاء".
    await accountMenu.cancelButton.click();
    // المتوقع: النافذة اتقفلت.
    await expect(accountMenu.confirmText).toBeHidden();
    // نعمل reload للصفحة.
    await page.reload();
    // المتوقع: لسه جوه لوحة التحكم.
    await expect(page).not.toHaveURL(/\/auth/);
  });

  // بعد الخروج مينفعش نفتح لوحة التحكم تاني.
  test('dashboard is not accessible after logout', { tag: '@regression' }, async ({ page }) => {
    // نسجّل دخول وبعدين خروج.
    await loginPage.open();
    await loginPage.login(validMerchant.email, validMerchant.password);
    await expect(page).not.toHaveURL(/\/auth/);
    await accountMenu.logout();
    await expect(page).toHaveURL(/\/auth/);
    // نحاول نفتح الصفحة الرئيسية للوحة التحكم مباشرة ("/ar" افتراض مننا).
    await page.goto(paths.home);
    // المتوقع: تحويل لصفحة الدخول.
    await expect(page).toHaveURL(/\/auth/);
  });

  // الزائر اللي مش مسجّل مينفعش يفتح لوحة التحكم.
  test('unauthenticated user is redirected to login', { tag: '@smoke' }, async ({ page }) => {
    // نفتح الصفحة الرئيسية للوحة التحكم مباشرة ("/ar" افتراض مننا).
    await page.goto(paths.home);
    // المتوقع: تحويل لصفحة الدخول.
    await expect(page).toHaveURL(/\/auth/);
  });
});
