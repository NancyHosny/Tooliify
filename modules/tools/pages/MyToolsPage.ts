import { Page, Locator } from '@playwright/test';
import { paths, qaPrefix, myToolsTexts } from '../../../test-data/test-data';

// Page Object لصفحة "أدواتي" (SRS 10.9 و 10.10): جدول فيه صف لكل أداة،
// وعدد الأدوات المضافة، ونافذة الحذف.
export class MyToolsPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly addToolButton: Locator;
  readonly countText: Locator;
  readonly rows: Locator;
  readonly deleteButtons: Locator;
  readonly instanceRows: Locator;
  readonly qaRows: Locator;
  readonly scheduleButton: Locator;
  readonly pageSize: Locator;
  readonly paginationText: Locator;
  readonly headerRow: Locator;
  readonly deleteDialog: Locator;
  readonly confirmDeleteButton: Locator;
  readonly closeDeleteButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1, name: 'أدواتي', exact: true });
    this.addToolButton = page.getByRole('button', { name: 'اضافة اداة' });
    this.countText = page.getByText(/\d+ اداة مضافة/);
    this.rows = page.locator('tbody tr');
    // كل أداة مضافة = سطر grid واحد. صف الجدول بيجمع كل نسخ نفس الأداة (حقيقية وQA مثلًا)، والـ grid هو اللي بيفرّق بينهم.
    this.instanceRows = page.locator('tbody div[style*="grid-template-columns"]');
    this.deleteButtons = this.rows.getByRole('button', { name: 'حذف' });
    this.qaRows = this.instanceRows.filter({ hasText: qaPrefix });
    this.scheduleButton = page.getByRole('button', { name: myToolsTexts.scheduleButton });
    this.pageSize = page.locator('#tablePageSize');
    this.paginationText = page.getByText(/\d+ - \d+ من \d+ عنصر/);
    this.headerRow = page.locator('thead');
    this.deleteDialog = page.getByRole('dialog');
    this.confirmDeleteButton = this.deleteDialog.getByRole('button', { name: 'حذف' });
    this.closeDeleteButton = this.deleteDialog.getByRole('button', { name: 'إغلاق' });
  }

  // نفتح الصفحة.
  async open() {
    await this.page.goto(paths.myTools, { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor();
    await this.rows.first().waitFor({ timeout: 15_000 }).catch(() => {});
  }

  // صف أداة معينة بنلاقيه باسمها.
  row(name: string): Locator {
    return this.instanceRows.filter({ hasText: name });
  }

  // زرار "معاينة الأداة" بتاع أداة معينة (بيفتح صفحة الأداة).
  previewButton(name: string): Locator {
    return this.row(name).getByRole('button', { name: myToolsTexts.previewButton });
  }

  // زرار "تخصيص <اسم الأداة>" بتاع أداة معينة (بيفتح صفحة تعديلها).
  editButton(name: string): Locator {
    return this.row(name).getByRole('button', { name: `${myToolsTexts.editButtonPrefix} ${name}` });
  }

  // رقم كارت الإحصائيات اللي عنوانه كذا (مثلًا "اجمالي الادوات المفعلة"): الرقم مكتوب في strong جنب العنوان.
  async statValue(label: string): Promise<number> {
    const text = await this.page.getByText(label, { exact: true }).locator('xpath=..').locator('strong').innerText();
    return Number(text);
  }

  // زرار "حذف" بتاع أداة معينة.
  deleteButton(name: string): Locator {
    return this.row(name).getByRole('button', { name: 'حذف' });
  }

  // مفتاح التشغيل/الإيقاف بتاع أداة معينة (بيفتح نافذة تأكيد لما نضغط عليه).
  statusSwitch(name: string): Locator {
    return this.row(name).getByRole('switch');
  }

  // زرار "تأكيد" في نافذة تغيير الحالة (بتستخدم نفس dialog نافذة الحذف).
  get confirmStatusButton(): Locator {
    return this.deleteDialog.getByRole('button', { name: 'تأكيد' });
  }

  // شارة حالة الأداة ("مفعلة" / "غير مفعلة").
  statusBadge(name: string): Locator {
    return this.row(name).locator('[data-slot="badge"]');
  }

  // نقرا الرقم من نص "N اداة مضافة".
  async addedCount(): Promise<number> {
    const text = await this.countText.innerText();
    return Number(text.match(/\d+/)?.[0] ?? 0);
  }

  // بنحذف كل الأدوات اللي اتعملت من التستات (اسمها بيبدأ ببادئة QA). الأدوات الحقيقية مبتتلمسش أبدًا.
  async deleteQaToolsFromPage() {
    await this.open();
    while ((await this.qaRows.count()) > 0) {
      await this.qaRows.first().getByRole('button', { name: 'حذف' }).click();
      await this.confirmDeleteButton.click();
      await this.page.waitForTimeout(3000);
      await this.open();
    }
  }
}
