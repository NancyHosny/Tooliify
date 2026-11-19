import { test, expect } from '../../shared/bug-capture';
import { LoginPage } from '../pages/LoginPage';
import {
  validMerchant,
  unregisteredEmail,
  wrongPassword,
  invalidEmails,
  shortPassword,
  messages,
  specialAccounts,
} from '../../../test-data/test-data';

// مجموعة كل تستات واجهة تسجيل الدخول (SRS 10.2).
test.describe('Authentication – Login UI (SRS 10.2)', () => {
  // الـ Page Object، بيتعمل من جديد لكل تست.
  let loginPage: LoginPage;

  // قبل كل تست: نفتح صفحة دخول جديدة.
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.open();
    await expect(loginPage.emailInput).toBeVisible();
  });

  // بيانات الدخول الصحيحة بتفتح لوحة التحكم.
  test('valid login redirects to dashboard', { tag: '@smoke' }, async ({ page }) => {
    await loginPage.login(validMerchant.email, validMerchant.password);
    await expect(page).not.toHaveURL(/\/auth/);
  });

  // الجلسة بتفضل شغّالة بعد reload للصفحة.
  test('session persists after reload', { tag: '@regression' }, async ({ page }) => {
    await loginPage.login(validMerchant.email, validMerchant.password);
    await expect(page).not.toHaveURL(/\/auth/);
    await page.reload();
    await expect(page).not.toHaveURL(/\/auth/);
  });

  // زرار الدخول معطّل طول ما حقل مطلوب فاضي.
  test('login button disabled when fields are empty', { tag: '@regression' }, async () => {
    // الخانتين فاضيتين: الزرار لازم يكون معطّل.
    await expect(loginPage.loginButton).toBeDisabled();
    await loginPage.emailInput.fill(unregisteredEmail);
    // كلمة المرور لسه فاضية: الزرار لازم يفضل معطّل.
    await expect(loginPage.loginButton).toBeDisabled();
  });

  // تست لكل شكل إيميل غلط.
  for (const email of invalidEmails) {
    test(`invalid email "${email}" shows validation message`, { tag: '@regression' }, async ({ page }) => {
      await loginPage.emailInput.fill(email);
      // نكتب أي كلمة مرور عشان النموذج يتبعت.
      await loginPage.passwordInput.fill(wrongPassword);
      await loginPage.loginButton.click();
      await expect(page.getByText(messages.emailInvalid)).toBeVisible();
    });
  }

  // إيميل مش مسجّل (SRS 10.2 Alt 2).
  test('unregistered email shows invalid credentials message', { tag: '@regression' }, async ({ page }) => {
    await loginPage.login(unregisteredEmail, wrongPassword);
    await expect(page.getByText(messages.invalidCredentials)).toBeVisible();
    await expect(page).toHaveURL(/\/auth/);
  });

  // إيميل مسجّل وكلمة مرور غلط (SRS 10.2 Alt 1).
  // بيتحسب محاولة فاشلة واحدة على الحساب الحقيقي.
  test('wrong password shows invalid credentials message', { tag: '@regression' }, async ({ page }) => {
    await loginPage.login(validMerchant.email, wrongPassword);
    await expect(page.getByText(messages.invalidCredentials)).toBeVisible();
    await expect(page).toHaveURL(/\/auth/);
  });

  // حد أدنى: كلمة مرور من 7 حروف (الحد الأدنى 8).
  test('password shorter than 8 characters does not log in', { tag: '@regression' }, async ({ page }) => {
    await loginPage.fillCredentials(unregisteredEmail, shortPassword);
    await expect(page).toHaveURL(/\/auth/);
  });

  // أيقونة العين بتظهر وتخفي كلمة المرور.
  test('show/hide password toggle', { tag: '@regression' }, async () => {
    await loginPage.passwordInput.fill(wrongPassword);
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    await loginPage.showPasswordToggle.click();
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');
  });

  // رابط "نسيت كلمة المرور" بيفتح صفحة الاسترجاع.
  test('forgot password link opens recovery page', { tag: '@regression' }, async ({ page }) => {
    await loginPage.forgotPasswordLink.click();
    await expect(page.getByRole('button', { name: /إرسال رمز التحقق|ارسال رمز التحقق/ })).toBeVisible();
  });
});

// الدخول بحسابات خاصة (SRS 10.2 Alt 3 و 4). كل تست بيتخطى لحد ما حسابه يتكتب في ملف .env.
test.describe('Authentication – Blocked accounts (SRS 10.2)', () => {
  // الـ Page Object، بيتعمل من جديد لكل تست.
  let loginPage: LoginPage;

  // قبل كل تست: نفتح صفحة دخول جديدة.
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.open();
  });

  // الاشتراك المنتهي مينفعش يدخل (Alt 3).
  test('expired subscription shows renew message', { tag: '@regression' }, async ({ page }) => {
    // نتخطى لو حساب الاشتراك المنتهي مش موجود في .env.
    test.skip(!specialAccounts.expired.email, 'EXPIRED_EMAIL is not set in .env');
    await loginPage.login(specialAccounts.expired.email, specialAccounts.expired.password);
    await expect(page.getByText(messages.subscriptionExpired)).toBeVisible();
    await expect(page).toHaveURL(/\/auth/);
  });

  // الحساب الموقوف مينفعش يدخل (Alt 4).
  test('suspended account shows suspension message', { tag: '@regression' }, async ({ page }) => {
    // نتخطى لو الحساب الموقوف مش موجود في .env.
    test.skip(!specialAccounts.suspended.email, 'SUSPENDED_EMAIL is not set in .env');
    await loginPage.login(specialAccounts.suspended.email, specialAccounts.suspended.password);
    await expect(page.getByText(messages.accountSuspended)).toBeVisible();
    await expect(page).toHaveURL(/\/auth/);
  });
});
