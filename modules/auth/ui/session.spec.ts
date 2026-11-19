import { test, expect } from '../../shared/bug-capture';
import { LoginPage } from '../pages/LoginPage';
import { AccountMenu } from '../pages/AccountMenu';
import { validMerchant, paths } from '../../../test-data/test-data';

// تسجيل الخروج والتحكم في الوصول (SRS 10.6 و 10.16).
test.describe('Authentication – Session & logout (SRS 10.6, 10.16)', () => {
  // الـ Page Objects، بتتعمل من جديد لكل تست.
  let loginPage: LoginPage;
  let accountMenu: AccountMenu;

  // قبل كل تست: نعمل الـ Page Objects.
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    accountMenu = new AccountMenu(page);
  });

  // تسجيل الخروج بالتأكيد بينهي الجلسة.
  test('logout ends the session', { tag: '@smoke' }, async ({ page }) => {
    await loginPage.open();
    await loginPage.login(validMerchant.email, validMerchant.password);
    await expect(page).not.toHaveURL(/\/auth/);
    await accountMenu.clickLogout();
    await expect(accountMenu.confirmText).toBeVisible();
    await accountMenu.confirmButton.click();
    await expect(page).toHaveURL(/\/auth/);
  });

  // "إلغاء" في نافذة الخروج بيسيب التاجر مسجّل دخول.
  test('cancel logout keeps the session', { tag: '@regression' }, async ({ page }) => {
    await loginPage.open();
    await loginPage.login(validMerchant.email, validMerchant.password);
    await expect(page).not.toHaveURL(/\/auth/);
    await accountMenu.clickLogout();
    await accountMenu.cancelButton.click();
    await expect(accountMenu.confirmText).toBeHidden();
    await page.reload();
    await expect(page).not.toHaveURL(/\/auth/);
  });

  // بعد الخروج مينفعش نفتح لوحة التحكم تاني.
  test('dashboard is not accessible after logout', { tag: '@regression' }, async ({ page }) => {
    await loginPage.open();
    await loginPage.login(validMerchant.email, validMerchant.password);
    await expect(page).not.toHaveURL(/\/auth/);
    await accountMenu.logout();
    await expect(page).toHaveURL(/\/auth/);
    await page.goto(paths.home);
    await expect(page).toHaveURL(/\/auth/);
  });

  // الزائر اللي مش مسجّل مينفعش يفتح لوحة التحكم.
  test('unauthenticated user is redirected to login', { tag: '@smoke' }, async ({ page }) => {
    await page.goto(paths.home);
    await expect(page).toHaveURL(/\/auth/);
  });
});
