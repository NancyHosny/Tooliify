// نستورد أنواع Playwright.
import { Page, Locator } from '@playwright/test';

// Page Object لنافذة "تعديل كلمة المرور".
export class ChangePasswordModal {
  // التاب (الصفحة) بتاعة المتصفح.
  readonly page: Page;
  // النافذة نفسها (الصندوق اللي فيه كل حاجة).
  readonly dialog: Locator;
  // خانة "كلمة المرور الحالية".
  readonly currentPasswordInput: Locator;
  // خانة "كلمة المرور الجديدة".
  readonly newPasswordInput: Locator;
  // خانة "تأكيد كلمة المرور الجديدة".
  readonly confirmPasswordInput: Locator;
  // زرار الحفظ (التطبيق بيسميه "تم الحفظ").
  readonly saveButton: Locator;

  // بنبني الـ Page Object.
  constructor(page: Page) {
    // نحفظ التاب.
    this.page = page;
    // النافذة هي dialog.
    this.dialog = page.getByRole('dialog');
    // الحقول: بنلاقيها بالـ name attribute بتاعها في الصفحة الحقيقية.
    this.currentPasswordInput = this.dialog.locator('input[name="currentPassword"]');
    this.newPasswordInput = this.dialog.locator('input[name="password"]');
    this.confirmPasswordInput = this.dialog.locator('input[name="confirmPassword"]');
    // زرار الحفظ.
    this.saveButton = this.dialog.getByRole('button', { name: 'تم الحفظ' });
  }

  // نملا الخانات التلاتة (من غير ما نبعت).
  async fill(current: string, newPassword: string, confirmation: string) {
    // كلمة المرور الحالية.
    await this.currentPasswordInput.fill(current);
    // كلمة المرور الجديدة.
    await this.newPasswordInput.fill(newPassword);
    // التأكيد، وبعدها Tab عشان فحص الخانة يشتغل.
    await this.confirmPasswordInput.fill(confirmation);
    await this.confirmPasswordInput.press('Tab');
  }
}
