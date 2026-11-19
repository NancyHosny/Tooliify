import { Page, Locator } from '@playwright/test';

// Page Object لنافذة المعاينة (بتتفتح بزرار العين على كارت في الكتالوج).
export class ToolPreviewModal {
  readonly page: Page;
  readonly dialog: Locator;
  readonly addButton: Locator;
  readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByRole('dialog');
    this.addButton = this.dialog.getByRole('button', { name: 'إضافة الأداة' });
    this.closeButton = this.dialog.getByRole('button', { name: 'إغلاق' });
  }

  // اسم الأداة اللي بيظهر كعنوان للنافذة.
  title(name: string): Locator {
    return this.dialog.getByRole('heading', { name, exact: true });
  }
}
