import { Page, Locator } from '@playwright/test';

// Page Object لتسجيل الخروج من القايمة الجانبية في لوحة التحكم (SRS 10.16).
export class AccountMenu {
  readonly page: Page;
  readonly logoutButton: Locator;
  readonly confirmText: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logoutButton = page.getByRole('button', { name: /تسجيل الخروج/ });
    // سؤال النافذة: الـ SRS مكتوب فيه "أنت" والتطبيق مكتوب فيه "انت"، فبنقبل الاتنين.
    this.confirmText = page.getByText(/هل (أ|ا)نت متأكد من تسجيل الخروج/);
    this.confirmButton = page.getByRole('button', { name: /^تأكيد$/ });
    this.cancelButton = page.getByRole('button', { name: /^إلغاء$/ });
  }

  // نضغط "تسجيل الخروج" (بيفتح نافذة التأكيد).
  async clickLogout() {
    await this.logoutButton.click();
  }

  // تسجيل خروج كامل: نضغط خروج ونأكد.
  async logout() {
    await this.clickLogout();
    await this.confirmButton.click();
  }
}
