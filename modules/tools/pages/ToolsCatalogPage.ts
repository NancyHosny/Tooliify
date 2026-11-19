import { Page, Locator } from '@playwright/test';
import { paths } from '../../../test-data/test-data';

// Page Object لصفحة كتالوج الأدوات "الأدوات" (SRS 10.8).
// كارت لكل أداة: شارة، اسم، وصف قصير، زرار معاينة، وزرار "إضافة الأداة" (أو "مضافة بالفعل").
export class ToolsCatalogPage {
  readonly page: Page;
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly badgeFilter: Locator;
  readonly clearFiltersButton: Locator;
  readonly cards: Locator;
  readonly cardNames: Locator;
  readonly addButtons: Locator;
  readonly addedButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.heading = page.getByRole('heading', { level: 1, name: 'الأدوات', exact: true });
    this.searchInput = page.getByPlaceholder('قم بالبحث باسم الأداة');
    this.badgeFilter = page.getByRole('combobox');
    this.clearFiltersButton = page.getByRole('button', { name: 'مسح الفلاتر' });
    this.cards = page.locator('article');
    this.cardNames = this.cards.getByRole('heading', { level: 2 });
    this.addButtons = this.cards.getByRole('button', { name: 'إضافة الأداة' });
    this.addedButtons = this.cards.getByRole('button', { name: 'مضافة بالفعل' });
  }

  // نفتح صفحة الكتالوج.
  async open() {
    // نروح لـ BASE_URL + /ar/tools. بنستنى تحميل الـ HTML بس لأن الصفحة بطيئة في التحميل.
    await this.page.goto(paths.tools, { waitUntil: 'domcontentloaded' });
    await this.cards.first().waitFor();
  }

  // تاب تصنيف بنلاقيه باسمه (مثلًا "الكل" أو "تواصل").
  tab(name: string): Locator {
    return this.page.getByRole('tab', { name, exact: true });
  }

  // كارت أداة معينة بنلاقيه باسم الأداة.
  card(name: string): Locator {
    return this.cards.filter({ has: this.page.getByRole('heading', { level: 2, name, exact: true }) });
  }

  // الشارة المكتوبة على الكارت ("جديد" أو "الأكثر استخداماً" أو "مقترح لعملائك").
  badgeOf(card: Locator): Locator {
    return card.locator('[data-slot="badge"]');
  }

  // الكروت اللي عليها شارة معينة.
  cardsWithBadge(badge: string): Locator {
    return this.cards.filter({ has: this.page.locator('[data-slot="badge"]', { hasText: badge }) });
  }

  // زرار المعاينة (العين) بتاع أداة معينة.
  previewButton(name: string): Locator {
    return this.card(name).getByRole('button', { name: 'معاينة الأداة' });
  }

  // زرار "إضافة الأداة" بتاع أداة معينة.
  addButton(name: string): Locator {
    return this.card(name).getByRole('button', { name: 'إضافة الأداة' });
  }

  // نختار شارة من القايمة المنسدلة.
  async selectBadge(badge: string) {
    await this.badgeFilter.click();
    await this.page.getByRole('option', { name: badge, exact: true }).click();
  }

  // نكتب كلمة بحث (الصفحة بتفلتر وإنت بتكتب وبتكتب ?search= في العنوان).
  async search(term: string) {
    await this.searchInput.fill(term);
  }

  // نقرا كل أسماء الأدوات الظاهرة دلوقتي.
  async names(): Promise<string[]> {
    return this.cardNames.allInnerTexts();
  }
}
