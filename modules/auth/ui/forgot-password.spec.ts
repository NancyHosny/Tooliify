import { test, expect } from '../../shared/bug-capture';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { validMerchant, unregisteredEmail, invalidEmails, messages, wrongOtp } from '../../../test-data/test-data';

// تنبيه: حدود SRS 10.4: أقصى 3 طلبات رمز كل 30 دقيقة، وأقصى 3 رموز غلط.
// آخر تست بس هو اللي بيستخدم الإيميل الحقيقي.

// مجموعة كل تستات "نسيت كلمة المرور" (SRS 10.4).
test.describe('Authentication – Forgot password (SRS 10.4)', () => {
  // الـ Page Object، بيتعمل من جديد لكل تست.
  let forgotPage: ForgotPasswordPage;

  // قبل كل تست: نفتح شاشة الاسترجاع.
  test.beforeEach(async ({ page }) => {
    forgotPage = new ForgotPasswordPage(page);
    await forgotPage.open();
    await expect(forgotPage.emailInput).toBeVisible();
  });

  // زرار الإرسال معطّل لحد ما نكتب إيميل.
  test('send code button disabled until a valid email is entered', { tag: '@regression' }, async () => {
    await expect(forgotPage.sendCodeButton).toBeDisabled();
    await forgotPage.emailInput.fill(unregisteredEmail);
    await expect(forgotPage.sendCodeButton).toBeEnabled();
  });

  // تست لكل شكل إيميل غلط.
  for (const email of invalidEmails) {
    test(`invalid email "${email}" shows validation message`, { tag: '@regression' }, async ({ page }) => {
      await forgotPage.emailInput.fill(email);
      await forgotPage.sendCodeButton.click();
      await expect(page.getByText(messages.emailInvalid)).toBeVisible();
    });
  }

  // الإيميل غير المسجّل بياخد رسالة عامة (SRS 10.4 Alt 1).
  test('unregistered email shows generic message', { tag: '@regression' }, async ({ page }) => {
    await forgotPage.requestCode(unregisteredEmail);
    await expect(page.getByText(messages.otpGenericSent)).toBeVisible();
  });

  // إيميل مسجّل: الرمز بيتبعت، إعادة الإرسال بتتقفل، والرمز الغلط بيترفض.
  test('registered email receives code and wrong code is rejected', { tag: '@smoke' }, async ({ page }) => {
    await forgotPage.requestCode(validMerchant.email);
    await expect(page.getByText(messages.otpSent).first()).toBeVisible();
    await expect(forgotPage.resendLink).toBeDisabled();
    await forgotPage.enterOtp(wrongOtp);
    await expect(page.getByText(messages.otpInvalid)).toBeVisible();
  });
});
