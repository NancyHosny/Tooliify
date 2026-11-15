// نستورد أنواع Playwright.
import { Page, Locator } from '@playwright/test';

// Page Object لنافذة "تعديل البيانات".
export class EditProfileModal {
  // التاب (الصفحة) بتاعة المتصفح.
  readonly page: Page;
  // النافذة نفسها (الصندوق اللي فيه كل حاجة).
  readonly dialog: Locator;
  // خانة "الاسم بالكامل".
  readonly nameInput: Locator;
  // خانة "البريد الالكتروني".
  readonly emailInput: Locator;
  // خانة "رقم الهاتف".
  readonly phoneInput: Locator;
  // زرار الحفظ (التطبيق بيسميه "تم الحفظ").
  readonly saveButton: Locator;
  // زرار "إغلاق".
  readonly closeButton: Locator;

  // بنبني الـ Page Object.
  constructor(page: Page) {
    // نحفظ التاب.
    this.page = page;
    // النافذة هي dialog.
    this.dialog = page.getByRole('dialog');
    // الحقول: بنلاقيها بالـ name attribute بتاعها في الصفحة الحقيقية.
    this.nameInput = this.dialog.locator('input[name="name"]');
    this.emailInput = this.dialog.locator('input[name="email"]');
    this.phoneInput = this.dialog.locator('input[name="phoneNumber"]');
    // الأزرار: بنلاقيها بأسمائها العربي.
    this.saveButton = this.dialog.getByRole('button', { name: 'تم الحفظ' });
    this.closeButton = this.dialog.getByRole('button', { name: 'إغلاق' });
  }

  // نكتب رقم هاتف جديد ونضغط حفظ.
  async savePhone(phone: string) {
    // نبدّل الرقم.
    await this.phoneInput.fill(phone);
    // نضغط حفظ.
    await this.saveButton.click();
  }
}
