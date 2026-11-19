import { test, expect } from '../../shared/bug-capture';
import { LoginPage } from '../pages/LoginPage';
import { SetPasswordPage } from '../pages/SetPasswordPage';
import { specialAccounts, messages, weakPasswords, strongPassword, mismatchedConfirmation, paths } from '../../../test-data/test-data';

// إجبار تغيير كلمة المرور في أول دخول (SRS 10.3).
// بتتخطى لحد ما FIRST_LOGIN_EMAIL و FIRST_LOGIN_PASSWORD يتكتبوا في .env.
// مفيش تست بيغيّر كلمة المرور، فالحساب بيفضل في حالة "أول دخول".
test.describe('Authentication – First login reset (SRS 10.3)', () => {
  // نتخطى المجموعة كلها لو الحساب مش موجود.
  test.skip(!specialAccounts.firstLogin.email, 'FIRST_LOGIN_EMAIL is not set in .env');

  // الـ Page Object، بيتعمل من جديد لكل تست.
  let setPasswordPage: SetPasswordPage;

  // قبل كل تست: نسجّل دخول بكلمة المرور المؤقتة.
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    setPasswordPage = new SetPasswordPage(page);
    await loginPage.open();
    await loginPage.login(specialAccounts.firstLogin.email, specialAccounts.firstLogin.password);
  });

  // كلمة المرور المؤقتة بتوديّ التاجر لشاشة "تعيين كلمة مرور جديدة".
  test('first login redirects to set-password screen', { tag: '@regression' }, async () => {
    await expect(setPasswordPage.newPasswordInput).toBeVisible();
    await expect(setPasswordPage.confirmPasswordInput).toBeVisible();
  });

  // الصفحات التانية ممنوعة قبل تعيين كلمة مرور جديدة (Alt 2).
  test('other pages redirect back with a warning', { tag: '@regression' }, async ({ page }) => {
    await expect(setPasswordPage.newPasswordInput).toBeVisible();
    await page.goto(paths.home);
    await expect(page.getByText(messages.mustSetPassword)).toBeVisible();
  });

  // تست لكل كلمة مرور ضعيفة (حالات حدّية وفئات مكافئة).
  for (const weak of weakPasswords) {
    test(`weak new password is rejected: ${weak.rule}`, { tag: '@regression' }, async ({ page }) => {
      await setPasswordPage.setPassword(weak.value, weak.value);
      await expect(page.getByText(messages.passwordRules)).toBeVisible();
    });
  }

  // التأكيد لازم يطابق كلمة المرور الجديدة (Alt 1).
  test('mismatched confirmation is rejected', { tag: '@regression' }, async ({ page }) => {
    await setPasswordPage.setPassword(strongPassword, mismatchedConfirmation);
    await expect(page.getByText(messages.passwordMismatch, { exact: true })).toBeVisible();
  });
});
