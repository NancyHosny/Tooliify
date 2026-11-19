import { Page, Locator } from '@playwright/test';

// Page Object لنافذة "تعديل البيانات".
export class EditProfileModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly nameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly saveButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog');
    this.nameInput = this.dialog.locator('input[name="name"]');
    this.emailInput = this.dialog.locator('input[name="email"]');
    this.phoneInput = this.dialog.locator('input[name="phoneNumber"]');
    this.saveButton = this.dialog.getByRole('button', { name: 'تم الحفظ' });
    this.closeButton = this.dialog.getByRole('button', { name: 'إغلاق' });
  }

  // نكتب رقم هاتف جديد ونضغط حفظ.
  async savePhone(phone: string) {
    await this.phoneInput.fill(phone);
    await this.saveButton.click();
  }
}
