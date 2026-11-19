import { Page, Locator } from '@playwright/test';
import { LoginPage } from './LoginPage';

// تنبيه: الـ locators دي لسه ما اتأكدش منها على الصفحة الحقيقية (مبنية من نصوص SRS 10.4). لو تست فشل صلّحيها بأداة "Pick locator".

// Page Object لـ "نسيت كلمة المرور" (SRS 10.4): شاشة الإيميل + شاشة رمز التحقق (OTP).
export class ForgotPasswordPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly sendCodeButton: Locator;
  readonly otpFirstInput: Locator;
  readonly resendLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel(/البريد/);
    this.sendCodeButton = page.getByRole('button', { name: /إرسال رمز التحقق|ارسال رمز التحقق/ });
    this.otpFirstInput = page.getByRole('textbox').first();
    this.resendLink = page.getByText(/إعادة إرسال الرمز|اعادة ارسال الرمز/);
  }

  // نفتح شاشة الاسترجاع من صفحة تسجيل الدخول.
  async open() {
    const loginPage = new LoginPage(this.page);
    await loginPage.open();
    await loginPage.forgotPasswordLink.click();
  }

  // نكتب الإيميل ونضغط "إرسال رمز التحقق".
  async requestCode(email: string) {
    await this.emailInput.fill(email);
    await this.sendCodeButton.click();
  }

  // نكتب رمز من 6 أرقام في حقل رمز التحقق.
  async enterOtp(code: string) {
    await this.otpFirstInput.click();
    await this.page.keyboard.type(code);
  }
}
