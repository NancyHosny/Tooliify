// نستورد أنواع Playwright.
import { Page, Locator } from '@playwright/test';

// Page Object لتسجيل الخروج من القايمة الجانبية في لوحة التحكم (SRS 10.16).
export class AccountMenu {
  // التاب (الصفحة) بتاعة المتصفح.
  readonly page: Page;
  // زرار "تسجيل الخروج" في القايمة الجانبية.
  readonly logoutButton: Locator;
  // السؤال اللي بيظهر في نافذة التأكيد.
  readonly confirmText: Locator;
  // زرار "تأكيد" في النافذة.
  readonly confirmButton: Locator;
  // زرار "إلغاء" في النافذة.
  readonly cancelButton: Locator;

  // بنبني الـ Page Object.
  constructor(page: Page) {
    // نحفظ التاب.
    this.page = page;
    // زرار الخروج: بنلاقيه باسمه العربي.
    this.logoutButton = page.getByRole('button', { name: /تسجيل الخروج/ });
    // سؤال النافذة: الـ SRS مكتوب فيه "أنت" والتطبيق مكتوب فيه "انت"، فبنقبل الاتنين.
    this.confirmText = page.getByText(/هل (أ|ا)نت متأكد من تسجيل الخروج/);
    // أزرار النافذة.
    this.confirmButton = page.getByRole('button', { name: /^تأكيد$/ });
    this.cancelButton = page.getByRole('button', { name: /^إلغاء$/ });
  }

  // نضغط "تسجيل الخروج" (بيفتح نافذة التأكيد).
  async clickLogout() {
    // نضغط زرار الخروج.
    await this.logoutButton.click();
  }

  // تسجيل خروج كامل: نضغط خروج ونأكد.
  async logout() {
    // نفتح نافذة التأكيد.
    await this.clickLogout();
    // نأكد.
    await this.confirmButton.click();
  }
}
