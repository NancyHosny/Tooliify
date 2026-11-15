// نستورد أنواع Playwright: Page = تاب المتصفح، Locator = طريقة نلاقي بيها عنصر.
import { Page, Locator } from '@playwright/test';
// نستورد الـ Page Object بتاع تسجيل الدخول، لأن الخطوات دي بتبدأ من صفحة الدخول.
import { LoginPage } from './LoginPage';

// تنبيه: الـ locators دي لسه ما اتأكدش منها على الصفحة الحقيقية (مبنية من نصوص SRS 10.4). لو تست فشل صلّحيها بأداة "Pick locator".

// Page Object لـ "نسيت كلمة المرور" (SRS 10.4): شاشة الإيميل + شاشة رمز التحقق (OTP).
export class ForgotPasswordPage {
  // التاب (الصفحة) اللي الـ Page Object ده بيتحكم فيها.
  readonly page: Page;
  // خانة الإيميل في شاشة الاسترجاع.
  readonly emailInput: Locator;
  // زرار "إرسال رمز التحقق".
  readonly sendCodeButton: Locator;
  // أول خانة في حقل رمز التحقق (OTP).
  readonly otpFirstInput: Locator;
  // زرار "إعادة إرسال الرمز" – بيبقى معطّل لمدة 60 ثانية.
  readonly resendLink: Locator;

  // بنبني الـ Page Object لتاب معين.
  constructor(page: Page) {
    // نحفظ التاب.
    this.page = page;
    // خانة الإيميل: بنلاقيها من الـ label العربي.
    this.emailInput = page.getByLabel(/البريد/);
    // زرار الإرسال: الـ SRS بيكتبه بهمزة وبدون همزة، فبنقبل الاتنين.
    this.sendCodeButton = page.getByRole('button', { name: /إرسال رمز التحقق|ارسال رمز التحقق/ });
    // أول خانة نصية في شاشة رمز التحقق.
    this.otpFirstInput = page.getByRole('textbox').first();
    // رابط إعادة الإرسال: بهمزة أو من غير همزة.
    this.resendLink = page.getByText(/إعادة إرسال الرمز|اعادة ارسال الرمز/);
  }

  // نفتح شاشة الاسترجاع من صفحة تسجيل الدخول.
  async open() {
    // نعمل Page Object تسجيل الدخول لنفس التاب.
    const loginPage = new LoginPage(this.page);
    // نفتح صفحة تسجيل الدخول.
    await loginPage.open();
    // نضغط "نسيت كلمة المرور".
    await loginPage.forgotPasswordLink.click();
  }

  // نكتب الإيميل ونضغط "إرسال رمز التحقق".
  async requestCode(email: string) {
    // نكتب الإيميل.
    await this.emailInput.fill(email);
    // نضغط زرار الإرسال.
    await this.sendCodeButton.click();
  }

  // نكتب رمز من 6 أرقام في حقل رمز التحقق.
  async enterOtp(code: string) {
    // نضغط على أول خانة في الحقل.
    await this.otpFirstInput.click();
    // نكتب الأرقام واحد واحد.
    await this.page.keyboard.type(code);
  }
}
