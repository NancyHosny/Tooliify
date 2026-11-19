import { Page, Locator } from '@playwright/test';

// Page Object لنافذة "تعديل كلمة المرور".
export class ChangePasswordModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly currentPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog');
    this.currentPasswordInput = this.dialog.locator('input[name="currentPassword"]');
    this.newPasswordInput = this.dialog.locator('input[name="password"]');
    this.confirmPasswordInput = this.dialog.locator('input[name="confirmPassword"]');
    this.saveButton = this.dialog.getByRole('button', { name: 'تم الحفظ' });
  }

  // نملا الخانات التلاتة (من غير ما نبعت).
  async fill(current: string, newPassword: string, confirmation: string) {
    await this.currentPasswordInput.fill(current);
    await this.newPasswordInput.fill(newPassword);
    // التأكيد، وبعدها Tab عشان فحص الخانة يشتغل.
    await this.confirmPasswordInput.fill(confirmation);
    await this.confirmPasswordInput.press('Tab');
  }
}
