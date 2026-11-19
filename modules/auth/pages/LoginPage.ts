import { Page, Locator } from '@playwright/test';
import { paths } from '../../../test-data/test-data';

// تنبيه: الـ locators دي لسه ما اتأكدش منها على الصفحة الحقيقية (مبنية من الـ labels العربي في SRS 10.2). لو تست فشل صلّحيها بـ "npx playwright codegen".

// Page Object لصفحة تسجيل الدخول في Tooliify (SRS 10.2).
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly showPasswordToggle: Locator;

  constructor(page: Page) {
    // نحفظ التاب عشان الدوال اللي تحت تستخدمه.
    this.page = page;
    this.emailInput = page.getByLabel(/البريد/);
    this.passwordInput = page.locator('input[type="password"], input[name="password"]');
    this.loginButton = page.getByRole('button', { name: /تسجيل الدخول/ });
    this.forgotPasswordLink = page.getByText(/نسيت كلمة المرور/);
    this.showPasswordToggle = page.getByRole('button', { name: /إظهار|إخفاء|show|hide/i });
  }

  // نفتح صفحة تسجيل الدخول (المسار من بيانات التست).
  async open() {
    await this.page.goto(paths.login);
  }

  // نكتب الإيميل وكلمة المرور (من غير ما نضغط دخول).
  async fillCredentials(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  // نملا النموذج ونضغط زرار الدخول.
  async login(email: string, password: string) {
    await this.fillCredentials(email, password);
    await this.loginButton.click();
  }
}
