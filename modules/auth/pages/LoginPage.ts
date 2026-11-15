// نستورد أنواع Playwright: Page = تاب المتصفح، Locator = طريقة نلاقي بيها عنصر.
import { Page, Locator } from '@playwright/test';
// نستورد بيانات التست (المسارات وبيانات الدخول).
import { paths } from '../../../test-data/test-data';

// تنبيه: الـ locators دي لسه ما اتأكدش منها على الصفحة الحقيقية (مبنية من الـ labels العربي في SRS 10.2). لو تست فشل صلّحيها بـ "npx playwright codegen".

// Page Object لصفحة تسجيل الدخول في Tooliify (SRS 10.2).
export class LoginPage {
  // التاب (الصفحة) اللي الـ Page Object ده بيتحكم فيها.
  readonly page: Page;
  // خانة الإيميل.
  readonly emailInput: Locator;
  // خانة كلمة المرور.
  readonly passwordInput: Locator;
  // زرار "تسجيل الدخول".
  readonly loginButton: Locator;
  // رابط "نسيت كلمة المرور".
  readonly forgotPasswordLink: Locator;
  // أيقونة العين اللي بتظهر وتخفي كلمة المرور.
  readonly showPasswordToggle: Locator;

  // بنبني الـ Page Object لتاب معين.
  constructor(page: Page) {
    // نحفظ التاب عشان الدوال اللي تحت تستخدمه.
    this.page = page;
    // خانة الإيميل: بنلاقيها من الـ label العربي.
    this.emailInput = page.getByLabel(/البريد/);
    // خانة كلمة المرور: بنلاقيها من نوعها (password).
    this.passwordInput = page.locator('input[type="password"], input[name="password"]');
    // زرار الدخول: بنلاقيه باسمه العربي.
    this.loginButton = page.getByRole('button', { name: /تسجيل الدخول/ });
    // نسيت كلمة المرور: بنلاقيه من نصه (رابط أو زرار).
    this.forgotPasswordLink = page.getByText(/نسيت كلمة المرور/);
    // أيقونة العين: زرار اسمه فيه "إظهار" أو "إخفاء".
    this.showPasswordToggle = page.getByRole('button', { name: /إظهار|إخفاء|show|hide/i });
  }

  // نفتح صفحة تسجيل الدخول (المسار من بيانات التست).
  async open() {
    // نروح لـ BASE_URL + LOGIN_PATH.
    await this.page.goto(paths.login);
  }

  // نكتب الإيميل وكلمة المرور (من غير ما نضغط دخول).
  async fillCredentials(email: string, password: string) {
    // نكتب الإيميل.
    await this.emailInput.fill(email);
    // نكتب كلمة المرور.
    await this.passwordInput.fill(password);
  }

  // نملا النموذج ونضغط زرار الدخول.
  async login(email: string, password: string) {
    // نملا الخانتين.
    await this.fillCredentials(email, password);
    // نضغط "تسجيل الدخول".
    await this.loginButton.click();
  }
}
