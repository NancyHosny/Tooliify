// نستورد أنواع Playwright (الصفحة والـ Locator).
import { Page, Locator } from '@playwright/test';
// نستورد بيانات التست (المسارات وبادئة QA).
import { paths, qaPrefix } from '../../../test-data/test-data';

// Page Object لصفحة "أدواتي" (SRS 10.9 و 10.10): جدول فيه صف لكل أداة،
// وعدد الأدوات المضافة، ونافذة الحذف.
export class MyToolsPage {
  // التاب (الصفحة) بتاعة المتصفح.
  readonly page: Page;
  // عنوان الصفحة "أدواتي".
  readonly heading: Locator;
  // زرار "اضافة اداة" (بيفتح الكتالوج).
  readonly addToolButton: Locator;
  // نص "N اداة مضافة" تحت العنوان.
  readonly countText: Locator;
  // كل صفوف الأدوات في الجدول.
  readonly rows: Locator;
  // كل أزرار الحذف (واحد لكل أداة مضافة).
  readonly deleteButtons: Locator;
  // سطر واحد لكل أداة مضافة (شوفي الـ constructor).
  readonly instanceRows: Locator;
  // صفوف الأدوات اللي اتعملت من التستات (اسمها بيبدأ ببادئة QA).
  readonly qaRows: Locator;
  // نافذة الحذف وأزرارها.
  readonly deleteDialog: Locator;
  readonly confirmDeleteButton: Locator;
  readonly closeDeleteButton: Locator;

  // بنبني الـ Page Object.
  constructor(page: Page) {
    // نحفظ التاب.
    this.page = page;
    // العنوان: الـ h1 بتاع الصفحة.
    this.heading = page.getByRole('heading', { level: 1, name: 'أدواتي', exact: true });
    // الأزرار والنصوص: بنلاقيها بأسمائها العربي.
    this.addToolButton = page.getByRole('button', { name: 'اضافة اداة' });
    this.countText = page.getByText(/\d+ اداة مضافة/);
    // الصفوف: صفوف جسم الجدول.
    this.rows = page.locator('tbody tr');
    // أداة مضافة (instance) = سطر grid واحد. صف الجدول الواحد بيجمع كل نسخ نفس الأداة،
    // فلو الأداة اتضافت مرتين (نسخة حقيقية ونسخة QA مثلًا) هيشاركوا صف واحد،
    // والسطر الداخلي (grid) هو اللي بيفرّق بينهم.
    this.instanceRows = page.locator('tbody div[style*="grid-template-columns"]');
    this.deleteButtons = this.rows.getByRole('button', { name: 'حذف' });
    this.qaRows = this.instanceRows.filter({ hasText: qaPrefix });
    // نافذة الحذف هي dialog.
    this.deleteDialog = page.getByRole('dialog');
    this.confirmDeleteButton = this.deleteDialog.getByRole('button', { name: 'حذف' });
    this.closeDeleteButton = this.deleteDialog.getByRole('button', { name: 'إغلاق' });
  }

  // نفتح الصفحة.
  async open() {
    // نروح لـ BASE_URL + /ar/my-tools.
    await this.page.goto(paths.myTools, { waitUntil: 'domcontentloaded' });
    // نستنى لحد ما العنوان يظهر.
    await this.heading.waitFor();
    // نستنى لحد ما صفوف الجدول تتحمّل (العنوان بيظهر قبل الصفوف). لو الحساب مفيهوش أدوات مفيش صفوف أصلًا.
    await this.rows.first().waitFor({ timeout: 15_000 }).catch(() => {});
  }

  // صف أداة معينة بنلاقيه باسمها.
  row(name: string): Locator {
    return this.instanceRows.filter({ hasText: name });
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
    // نقرا النص ونسيب الأرقام بس.
    const text = await this.countText.innerText();
    return Number(text.match(/\d+/)?.[0] ?? 0);
  }

  // بنحذف كل الأدوات اللي اتعملت من التستات (اسمها بيبدأ ببادئة QA). الأدوات الحقيقية مبتتلمسش أبدًا.
  async deleteQaTools() {
    // نفتح الصفحة.
    await this.open();
    // نكرر طول ما لسه في صف QA ظاهر.
    while ((await this.qaRows.count()) > 0) {
      // نفتح نافذة حذف أول صف QA ونأكد.
      await this.qaRows.first().getByRole('button', { name: 'حذف' }).click();
      await this.confirmDeleteButton.click();
      // نستنى السيرفر شوية وبعدين نعمل reload (القايمة مش دايمًا بتتحدث لوحدها).
      await this.page.waitForTimeout(3000);
      await this.open();
    }
  }
}
