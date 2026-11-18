// نستورد أنواع Playwright.
import { Page, Locator } from '@playwright/test';
// نستورد بيانات التست (المسار والنصوص).
import { paths, scheduleTexts } from '../../../test-data/test-data';

// Page Object لصفحة "الجدولة": جدول فيه صف لكل أداة تدعم الجدولة،
// وزرار "جدولة مجموعة" بيفتح لوحة جانبية لجدولة أكتر من أداة مرة واحدة.
export class SchedulingPage {
  // التاب (الصفحة) بتاعة المتصفح.
  readonly page: Page;
  // عنوان الصفحة "الجدولة".
  readonly heading: Locator;
  // خانة البحث (في الصفحة نسختين، واحدة بس ظاهرة).
  readonly searchInput: Locator;
  // نص "N اداة مضافة" تحت العنوان.
  readonly countText: Locator;
  // زرار "جدولة مجموعة".
  readonly groupButton: Locator;
  // صف لكل أداة (سطر grid واحد).
  readonly rows: Locator;
  // رسالة الشاشة الفاضية وزرارها (لما مفيش أدوات للجدولة).
  readonly emptyTitle: Locator;
  readonly emptyHint: Locator;
  readonly addToolsButton: Locator;
  // لوحة جدولة المجموعة: عنوانها، قسم الأدوات المختارة، الخانات، وزرار الإرسال.
  readonly groupTitle: Locator;
  readonly groupSelected: Locator;
  readonly groupStartDate: Locator;
  readonly groupEndDate: Locator;
  readonly groupStartTime: Locator;
  readonly groupEndTime: Locator;
  readonly groupSubmit: Locator;
  readonly groupCloseButton: Locator;
  // خانة "تحديد كل الأدوات" في رأس الجدول.
  readonly selectAll: Locator;

  // بنبني الـ Page Object.
  constructor(page: Page) {
    // نحفظ التاب.
    this.page = page;
    // العنوان: الـ h1 بتاع الصفحة.
    this.heading = page.getByRole('heading', { level: 1, name: 'الجدولة', exact: true });
    // البحث: خانة search الظاهرة بس.
    this.searchInput = page.locator('input[type="search"]:visible');
    this.countText = page.getByText(/\d+ اداة مضافة/).first();
    this.groupButton = page.getByRole('button', { name: scheduleTexts.groupButton });
    // الصفوف: سطر grid جوه جسم الجدول.
    this.rows = page.locator('tbody div[style*="grid-template-columns"]');
    // الشاشة الفاضية.
    this.emptyTitle = page.getByText(scheduleTexts.emptyTitle);
    this.emptyHint = page.getByText(scheduleTexts.emptyHint);
    this.addToolsButton = page.getByRole('button', { name: scheduleTexts.addTools });
    // لوحة المجموعة: خانات التاريخ هي الـ popover-trigger الوحيدة في الصفحة (النافذة الفردية مقفولة وقتها).
    this.groupTitle = page.getByText(scheduleTexts.groupTitle, { exact: true });
    this.groupSelected = page.getByText(scheduleTexts.groupSelected, { exact: true });
    this.groupStartDate = page.locator('[data-slot="popover-trigger"]').nth(0);
    this.groupEndDate = page.locator('[data-slot="popover-trigger"]').nth(1);
    this.groupStartTime = page.locator('input[name="startTime"]');
    this.groupEndTime = page.locator('input[name="endTime"]');
    this.groupSubmit = page.getByRole('button', { name: new RegExp(scheduleTexts.groupSubmit) });
    this.groupCloseButton = page.getByRole('button', { name: scheduleTexts.closeButton });
    this.selectAll = page.getByRole('checkbox', { name: scheduleTexts.selectAll }).first();
  }

  // نفتح صفحة الجدولة.
  async open() {
    // نروح لـ BASE_URL + /ar/scheduling.
    await this.page.goto(paths.scheduling, { waitUntil: 'domcontentloaded' });
    // نستنى العنوان.
    await this.heading.waitFor();
    // نستنى لحد ما الصفوف أو الشاشة الفاضية تظهر (العنوان بيظهر قبل البيانات).
    await this.rows.first().or(this.emptyTitle).waitFor({ timeout: 30_000 });
  }

  // صف أداة معينة بنلاقيه باسمها.
  row(name: string): Locator {
    return this.rows.filter({ hasText: name });
  }

  // أيقونة "اعدادات الجدولة" بتاعة أداة (بتفتح نافذة الجدولة).
  settingsButton(name: string): Locator {
    return this.row(name).getByRole('button', { name: scheduleTexts.settingsLabel });
  }

  // خانة اختيار الأداة في صفها (بتستخدم لجدولة المجموعة).
  rowCheckbox(name: string): Locator {
    return this.row(name).getByRole('checkbox');
  }

  // مفتاح تفعيل/إيقاف الأداة في صفها (بيتفعّل بس لما الأداة تبقى مجدولة).
  rowSwitch(name: string): Locator {
    return this.row(name).getByRole('switch');
  }

  // نكتب كلمة في خانة البحث.
  async search(term: string) {
    await this.searchInput.fill(term);
  }

  // نقرا الرقم من نص "N اداة مضافة".
  async addedCount(): Promise<number> {
    const text = await this.countText.innerText();
    return Number(text.match(/\d+/)?.[0] ?? 0);
  }

  // نختار يوم من التقويم: نفتح التقويم من الخانة، ننتقل للشهر الجاي (عشان التاريخ يبقى في المستقبل)، ونضغط على اليوم.
  // اليوم من 10 لـ 20 عشان يظهر مرة واحدة بس في الشبكة (الأيام اللي من الشهور التانية بتبقى أول الشهر أو آخره).
  async pickDate(trigger: Locator, day: number) {
    // نفتح التقويم.
    await trigger.click();
    // ننتقل للشهر الجاي.
    await this.page.getByRole('button', { name: scheduleTexts.nextMonth }).click();
    // نضغط على اليوم المطلوب.
    await this.page.locator('td[role="gridcell"] button', { hasText: new RegExp(`^${day}$`) }).click();
  }
}
