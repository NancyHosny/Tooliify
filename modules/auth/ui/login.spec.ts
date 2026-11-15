// نستورد test (عشان نعرّف التستات) و expect (عشان نفحص النتايج) من Playwright.
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Object بتاع تسجيل الدخول.
import { LoginPage } from '../pages/LoginPage';
// نستورد بيانات التست ورسايل الـ SRS المتوقعة.
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
    // نعمل الـ Page Object لتاب التست ده.
    loginPage = new LoginPage(page);
    // نفتح صفحة الدخول.
    await loginPage.open();
    // نتأكد إن خانة الإيميل ظاهرة قبل ما التست يبدأ.
    await expect(loginPage.emailInput).toBeVisible();
  });

  // بيانات الدخول الصحيحة بتفتح لوحة التحكم.
  test('valid login redirects to dashboard', { tag: '@smoke' }, async ({ page }) => {
    // نسجّل دخول بحساب التاجر الصحيح.
    await loginPage.login(validMerchant.email, validMerchant.password);
    // المتوقع: خرجنا من صفحة الدخول.
    await expect(page).not.toHaveURL(/\/auth/);
  });

  // الجلسة بتفضل شغّالة بعد reload للصفحة.
  test('session persists after reload', { tag: '@regression' }, async ({ page }) => {
    // نسجّل دخول بالحساب الصحيح.
    await loginPage.login(validMerchant.email, validMerchant.password);
    // نستنى لحد ما نبقى جوه لوحة التحكم.
    await expect(page).not.toHaveURL(/\/auth/);
    // نعمل reload للصفحة.
    await page.reload();
    // المتوقع: لسه مرجعناش لصفحة الدخول.
    await expect(page).not.toHaveURL(/\/auth/);
  });

  // زرار الدخول معطّل طول ما حقل مطلوب فاضي.
  test('login button disabled when fields are empty', { tag: '@regression' }, async () => {
    // الخانتين فاضيتين: الزرار لازم يكون معطّل.
    await expect(loginPage.loginButton).toBeDisabled();
    // نملا الإيميل بس.
    await loginPage.emailInput.fill(unregisteredEmail);
    // كلمة المرور لسه فاضية: الزرار لازم يفضل معطّل.
    await expect(loginPage.loginButton).toBeDisabled();
  });

  // تست لكل شكل إيميل غلط.
  for (const email of invalidEmails) {
    test(`invalid email "${email}" shows validation message`, { tag: '@regression' }, async ({ page }) => {
      // نكتب الإيميل الغلط.
      await loginPage.emailInput.fill(email);
      // نكتب أي كلمة مرور عشان النموذج يتبعت.
      await loginPage.passwordInput.fill(wrongPassword);
      // نضغط دخول: التطبيق الحقيقي بيفحص الإيميل عند الإرسال بس.
      await loginPage.loginButton.click();
      // المتوقع: "البريد الالكتروني غير صحيح".
      await expect(page.getByText(messages.emailInvalid)).toBeVisible();
    });
  }

  // إيميل مش مسجّل (SRS 10.2 Alt 2).
  test('unregistered email shows invalid credentials message', { tag: '@regression' }, async ({ page }) => {
    // نحاول ندخل بإيميل مش موجود.
    await loginPage.login(unregisteredEmail, wrongPassword);
    // المتوقع: رسالة بيانات الدخول غير صحيحة.
    await expect(page.getByText(messages.invalidCredentials)).toBeVisible();
    // المتوقع: لسه في صفحة الدخول.
    await expect(page).toHaveURL(/\/auth/);
  });

  // إيميل مسجّل وكلمة مرور غلط (SRS 10.2 Alt 1).
  // بيتحسب محاولة فاشلة واحدة على الحساب الحقيقي.
  test('wrong password shows invalid credentials message', { tag: '@regression' }, async ({ page }) => {
    // نسجّل دخول بالإيميل الحقيقي وكلمة مرور غلط.
    await loginPage.login(validMerchant.email, wrongPassword);
    // المتوقع: رسالة بيانات الدخول غير صحيحة.
    await expect(page.getByText(messages.invalidCredentials)).toBeVisible();
    // المتوقع: لسه في صفحة الدخول.
    await expect(page).toHaveURL(/\/auth/);
  });

  // حد أدنى: كلمة مرور من 7 حروف (الحد الأدنى 8).
  test('password shorter than 8 characters does not log in', { tag: '@regression' }, async ({ page }) => {
    // نملا النموذج بالإيميل غير المسجّل وكلمة المرور القصيرة.
    await loginPage.fillCredentials(unregisteredEmail, shortPassword);
    // الـ SRS مفيهوش رسالة لده، فبنتأكد بس إن المستخدم ما دخلش.
    await expect(page).toHaveURL(/\/auth/);
  });

  // أيقونة العين بتظهر وتخفي كلمة المرور.
  test('show/hide password toggle', { tag: '@regression' }, async () => {
    // نكتب أي كلمة مرور.
    await loginPage.passwordInput.fill(wrongPassword);
    // افتراضيًا كلمة المرور مخفية.
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
    // نضغط أيقونة العين.
    await loginPage.showPasswordToggle.click();
    // دلوقتي كلمة المرور ظاهرة.
    await expect(loginPage.passwordInput).toHaveAttribute('type', 'text');
  });

  // رابط "نسيت كلمة المرور" بيفتح صفحة الاسترجاع.
  test('forgot password link opens recovery page', { tag: '@regression' }, async ({ page }) => {
    // نضغط "نسيت كلمة المرور".
    await loginPage.forgotPasswordLink.click();
    // المتوقع: زرار "إرسال رمز التحقق" ظاهر.
    await expect(page.getByRole('button', { name: /إرسال رمز التحقق|ارسال رمز التحقق/ })).toBeVisible();
  });
});

// الدخول بحسابات خاصة (SRS 10.2 Alt 3 و 4). كل تست بيتخطى لحد ما حسابه يتكتب في ملف .env.
test.describe('Authentication – Blocked accounts (SRS 10.2)', () => {
  // الـ Page Object، بيتعمل من جديد لكل تست.
  let loginPage: LoginPage;

  // قبل كل تست: نفتح صفحة دخول جديدة.
  test.beforeEach(async ({ page }) => {
    // نعمل الـ Page Object.
    loginPage = new LoginPage(page);
    // نفتح صفحة الدخول.
    await loginPage.open();
  });

  // الاشتراك المنتهي مينفعش يدخل (Alt 3).
  test('expired subscription shows renew message', { tag: '@regression' }, async ({ page }) => {
    // نتخطى لو حساب الاشتراك المنتهي مش موجود في .env.
    test.skip(!specialAccounts.expired.email, 'EXPIRED_EMAIL is not set in .env');
    // نسجّل دخول بالحساب المنتهي اشتراكه.
    await loginPage.login(specialAccounts.expired.email, specialAccounts.expired.password);
    // المتوقع: "اشتراكك منتهي ،يرجى تجديد الاشتراك للمتابعة".
    await expect(page.getByText(messages.subscriptionExpired)).toBeVisible();
    // المتوقع: ما دخلش.
    await expect(page).toHaveURL(/\/auth/);
  });

  // الحساب الموقوف مينفعش يدخل (Alt 4).
  test('suspended account shows suspension message', { tag: '@regression' }, async ({ page }) => {
    // نتخطى لو الحساب الموقوف مش موجود في .env.
    test.skip(!specialAccounts.suspended.email, 'SUSPENDED_EMAIL is not set in .env');
    // نسجّل دخول بالحساب الموقوف.
    await loginPage.login(specialAccounts.suspended.email, specialAccounts.suspended.password);
    // المتوقع: "تم ايقاف الحساب ،يرجى التواصل مع الدعم".
    await expect(page.getByText(messages.accountSuspended)).toBeVisible();
    // المتوقع: ما دخلش.
    await expect(page).toHaveURL(/\/auth/);
  });
});
