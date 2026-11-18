// نستورد أنواع Playwright.
import { Page, Locator } from '@playwright/test';
// نستورد بيانات التست (المسار والنصوص).
import { paths, couponTexts } from '../../../test-data/test-data';

// Page Object لصفحة "الكوبونات": قايمة بكل الكوبونات مع بحث وفلاتر،
// وفي كل صف زراير نسخ الرمز والتعديل والحذف ومفتاح التفعيل/الإيقاف (بيفتح نافذة تأكيد).
export class CouponsPage {
  // التاب (الصفحة) بتاعة المتصفح.
  readonly page: Page;
  // عنوان الصفحة "الكوبونات".
  readonly heading: Locator;
  // نص "(N كوبون مضاف)" جنب العنوان.
  readonly countText: Locator;
  // نص "اخر مزامنة للكوبونات مع سلة".
  readonly syncText: Locator;
  // زرار "اضافة كوبون" (بيفتح صفحة كوبون جديد).
  readonly addButton: Locator;
  // خانة البحث بالاسم أو الرمز.
  readonly searchInput: Locator;
  // فلتر المصدر (الكل / يدوي - Toolify / تلقائي / سلة) وفلتر الحالة.
  readonly sourceFilter: Locator;
  readonly statusFilter: Locator;
  // قايمة "العناصر في الصفحة" (select عادي).
  readonly pageSize: Locator;
  // صف لكل كوبون (سطر grid واحد).
  readonly rows: Locator;
  // رسالة "لا توجد كوبونات مطابقة" لما البحث مبيرجّعش حاجة.
  readonly emptyTitle: Locator;
  // نافذة التأكيد (إيقاف الكوبون أو حذفه).
  readonly dialog: Locator;

  // بنبني الـ Page Object.
  constructor(page: Page) {
    // نحفظ التاب.
    this.page = page;
    // العنوان: الـ h1 بتاع الصفحة.
    this.heading = page.getByRole('heading', { level: 1, name: couponTexts.pageTitle, exact: true });
    this.countText = page.getByText(/\(\d+ كوبون مضاف\)/);
    this.syncText = page.getByText(couponTexts.syncLabel);
    this.addButton = page.getByRole('button', { name: couponTexts.addButton });
    this.searchInput = page.getByPlaceholder(couponTexts.searchPlaceholder);
    // الفلتران هما أول قايمتين combobox في الصفحة.
    this.sourceFilter = page.getByRole('combobox').nth(0);
    this.statusFilter = page.getByRole('combobox').nth(1);
    this.pageSize = page.locator('#tablePageSize');
    // الصفوف: سطر grid جوه جسم الجدول.
    this.rows = page.locator('tbody div[style*="grid-template-columns"]');
    this.emptyTitle = page.getByText(couponTexts.emptyTitle);
    this.dialog = page.getByRole('dialog');
  }

  // نفتح صفحة الكوبونات.
  async open() {
    // نروح لـ BASE_URL + /ar/coupons.
    await this.page.goto(paths.coupons, { waitUntil: 'domcontentloaded' });
    // نستنى العنوان.
    await this.heading.waitFor();
    // نستنى لحد ما الصفوف أو الشاشة الفاضية تظهر (العنوان بيظهر قبل البيانات).
    await this.rows.first().or(this.emptyTitle).waitFor({ timeout: 30_000 });
  }

  // صف كوبون معين بنلاقيه من الرمز أو الاسم.
  row(codeOrName: string): Locator {
    return this.rows.filter({ hasText: codeOrName });
  }

  // زرار "نسخ رمز الكوبون" في صف.
  copyButton(codeOrName: string): Locator {
    return this.row(codeOrName).getByRole('button', { name: new RegExp(couponTexts.copyButton) });
  }

  // زرار "تعديل الكوبون" في صف.
  editButton(codeOrName: string): Locator {
    return this.row(codeOrName).getByRole('button', { name: couponTexts.editButton });
  }

  // زرار "حذف الكوبون" في صف.
  deleteButton(codeOrName: string): Locator {
    return this.row(codeOrName).getByRole('button', { name: couponTexts.deleteButton });
  }

  // كلمة "تفعيل" أو "ايقاف" جنب المفتاح في الصف (بنضغط عليها لأن المفتاح نفسه بيتغطى بيها).
  toggleLabel(codeOrName: string, label: string): Locator {
    return this.row(codeOrName).getByText(label, { exact: true });
  }

  // نكتب كلمة في خانة البحث.
  async search(term: string) {
    await this.searchInput.fill(term);
  }

  // نختار اختيار من فلتر (بنفتح القايمة ونضغط الاختيار).
  async choose(filter: Locator, option: string) {
    await filter.click();
    await this.page.getByRole('option', { name: option, exact: true }).first().click();
  }

  // نقرا الرقم من نص "(N كوبون مضاف)".
  async addedCount(): Promise<number> {
    const text = await this.countText.innerText();
    return Number(text.match(/\d+/)?.[0] ?? 0);
  }
}
