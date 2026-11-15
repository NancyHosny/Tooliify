// نستورد أنواع Playwright.
import { Page, Locator } from '@playwright/test';

// تنبيه: الـ locators دي لسه ما اتأكدش منها على الصفحة الحقيقية (مبنية من نصوص SRS 10.3 و 10.5).

// Page Object لشاشة "تعيين كلمة مرور جديدة" (أول دخول SRS 10.3، وإعادة التعيين بعد OTP SRS 10.5).
export class SetPasswordPage {
  // التاب (الصفحة) بتاعة المتصفح.
  readonly page: Page;
  // خانة "كلمة المرور الجديدة" (أول خانة باسورد).
  readonly newPasswordInput: Locator;
  // خانة "تأكيد كلمة المرور" (تاني خانة باسورد).
  readonly confirmPasswordInput: Locator;
  // زرار الإرسال ("تعيين كلمة المرور" أو "تأكيد").
  readonly submitButton: Locator;

  // بنبني الـ Page Object.
  constructor(page: Page) {
    // نحفظ التاب.
    this.page = page;
    // أول خانة باسورد هي كلمة المرور الجديدة.
    this.newPasswordInput = page.locator('input[type="password"]').nth(0);
    // تاني خانة باسورد هي التأكيد.
    this.confirmPasswordInput = page.locator('input[type="password"]').nth(1);
    // زرار الإرسال: بنقبل الاسمين المكتوبين في الـ SRS.
    this.submitButton = page.getByRole('button', { name: /تعيين كلمة المرور|تأكيد/ });
  }

  // نكتب الباسوردين ونضغط إرسال.
  async setPassword(newPassword: string, confirmation: string) {
    // نكتب كلمة المرور الجديدة.
    await this.newPasswordInput.fill(newPassword);
    // نكتب التأكيد.
    await this.confirmPasswordInput.fill(confirmation);
    // نضغط إرسال.
    await this.submitButton.click();
  }
}
