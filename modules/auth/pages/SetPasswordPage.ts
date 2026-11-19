import { Page, Locator } from '@playwright/test';

// تنبيه: الـ locators دي لسه ما اتأكدش منها على الصفحة الحقيقية (مبنية من نصوص SRS 10.3 و 10.5).

// Page Object لشاشة "تعيين كلمة مرور جديدة" (أول دخول SRS 10.3، وإعادة التعيين بعد OTP SRS 10.5).
export class SetPasswordPage {
  readonly page: Page;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newPasswordInput = page.locator('input[type="password"]').nth(0);
    this.confirmPasswordInput = page.locator('input[type="password"]').nth(1);
    this.submitButton = page.getByRole('button', { name: /تعيين كلمة المرور|تأكيد/ });
  }

  // نكتب الباسوردين ونضغط إرسال.
  async setPassword(newPassword: string, confirmation: string) {
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(confirmation);
    await this.submitButton.click();
  }
}
