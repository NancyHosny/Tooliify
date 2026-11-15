// نستورد test و expect من Playwright.
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Object بتاع "نسيت كلمة المرور".
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
// نستورد بيانات التست ورسايل الـ SRS المتوقعة.
import { validMerchant, unregisteredEmail, invalidEmails, messages, wrongOtp } from '../../../test-data/test-data';

// تنبيه: حدود SRS 10.4: أقصى 3 طلبات رمز كل 30 دقيقة، وأقصى 3 رموز غلط.
// آخر تست بس هو اللي بيستخدم الإيميل الحقيقي.

// مجموعة كل تستات "نسيت كلمة المرور" (SRS 10.4).
test.describe('Authentication – Forgot password (SRS 10.4)', () => {
  // الـ Page Object، بيتعمل من جديد لكل تست.
  let forgotPage: ForgotPasswordPage;

  // قبل كل تست: نفتح شاشة الاسترجاع.
  test.beforeEach(async ({ page }) => {
    // نعمل الـ Page Object.
    forgotPage = new ForgotPasswordPage(page);
    // نضغط "نسيت كلمة المرور" في صفحة الدخول.
    await forgotPage.open();
    // نتأكد إن خانة الإيميل ظاهرة.
    await expect(forgotPage.emailInput).toBeVisible();
  });

  // زرار الإرسال معطّل لحد ما نكتب إيميل.
  test('send code button disabled until a valid email is entered', { tag: '@regression' }, async () => {
    // الإيميل فاضي: الزرار معطّل.
    await expect(forgotPage.sendCodeButton).toBeDisabled();
    // نكتب إيميل بشكل صحيح.
    await forgotPage.emailInput.fill(unregisteredEmail);
    // دلوقتي الزرار شغّال.
    await expect(forgotPage.sendCodeButton).toBeEnabled();
  });

  // تست لكل شكل إيميل غلط.
  for (const email of invalidEmails) {
    test(`invalid email "${email}" shows validation message`, { tag: '@regression' }, async ({ page }) => {
      // نكتب الإيميل الغلط.
      await forgotPage.emailInput.fill(email);
      // نضغط إرسال: التطبيق الحقيقي بيفحص الإيميل عند الإرسال بس.
      await forgotPage.sendCodeButton.click();
      // المتوقع: "البريد الالكتروني غير صحيح".
      await expect(page.getByText(messages.emailInvalid)).toBeVisible();
    });
  }

  // الإيميل غير المسجّل بياخد رسالة عامة (SRS 10.4 Alt 1).
  test('unregistered email shows generic message', { tag: '@regression' }, async ({ page }) => {
    // نطلب رمز لإيميل مش موجود.
    await forgotPage.requestCode(unregisteredEmail);
    // المتوقع: الرسالة العامة.
    await expect(page.getByText(messages.otpGenericSent)).toBeVisible();
  });

  // إيميل مسجّل: الرمز بيتبعت، إعادة الإرسال بتتقفل، والرمز الغلط بيترفض.
  test('registered email receives code and wrong code is rejected', { tag: '@smoke' }, async ({ page }) => {
    // نطلب رمز للحساب الحقيقي.
    await forgotPage.requestCode(validMerchant.email);
    // المتوقع: "تم ارسال رمز التحقق".
    await expect(page.getByText(messages.otpSent).first()).toBeVisible();
    // المتوقع: رابط إعادة الإرسال معطّل لمدة 60 ثانية.
    await expect(forgotPage.resendLink).toBeDisabled();
    // نكتب رمز غلط من 6 أرقام (بنفترض إنه بيتفحص تلقائيًا – محتاج تأكيد).
    await forgotPage.enterOtp(wrongOtp);
    // المتوقع (SRS 10.4 Alt 2): "رمز التحقق غير صحيح".
    await expect(page.getByText(messages.otpInvalid)).toBeVisible();
  });
});
