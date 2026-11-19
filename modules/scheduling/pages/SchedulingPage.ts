import { Page, Locator } from '@playwright/test';
import { paths, scheduleTexts } from '../../../test-data/test-data';

// Page Object لصفحة "الجدولة": جدول فيه صف لكل أداة تدعم الجدولة،
// وزرار "جدولة مجموعة" بيفتح لوحة جانبية لجدولة أكتر من أداة مرة واحدة.
export class SchedulingPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly countText: Locator;
  readonly groupButton: Locator;
  readonly rows: Locator;
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
  readonly selectAll: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1, name: 'الجدولة', exact: true });
    this.searchInput = page.locator('input[type="search"]:visible');
    this.countText = page.getByText(/\d+ اداة مضافة/).first();
    this.groupButton = page.getByRole('button', { name: scheduleTexts.groupButton });
    this.rows = page.locator('tbody div[style*="grid-template-columns"]');
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
    await this.page.goto(paths.scheduling, { waitUntil: 'domcontentloaded' });
    await this.heading.waitFor();
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
    await trigger.click();
    await this.page.getByRole('button', { name: scheduleTexts.nextMonth }).click();
    await this.page.locator('td[role="gridcell"] button', { hasText: new RegExp(`^${day}$`) }).click();
  }
}
