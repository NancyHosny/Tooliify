// نستورد أنواع Playwright.
import { Page, Locator } from '@playwright/test';

// Page Object لنافذة المعاينة (بتتفتح بزرار العين على كارت في الكتالوج).
export class ToolPreviewModal {
  // التاب (الصفحة) بتاعة المتصفح.
  readonly page: Page;
  // النافذة نفسها (الصندوق اللي بيحتوي كل حاجة).
  readonly dialog: Locator;
  // زرار "إضافة الأداة" جوه النافذة.
  readonly addButton: Locator;
  // زرار "إغلاق" جوه النافذة.
  readonly closeButton: Locator;

  // بنبني الـ Page Object.
  constructor(page: Page) {
    // نحفظ التاب.
    this.page = page;
    // النافذة بتتعرف بالـ role وهو dialog.
    this.dialog = page.getByRole('dialog');
    // الأزرار بنلاقيها بأسمائها العربي.
    this.addButton = this.dialog.getByRole('button', { name: 'إضافة الأداة' });
    this.closeButton = this.dialog.getByRole('button', { name: 'إغلاق' });
  }

  // اسم الأداة اللي بيظهر كعنوان للنافذة.
  title(name: string): Locator {
    return this.dialog.getByRole('heading', { name, exact: true });
  }
}
