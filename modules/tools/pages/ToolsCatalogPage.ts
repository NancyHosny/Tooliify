// نستورد أنواع Playwright (الصفحة والـ Locator).
import { Page, Locator } from '@playwright/test';
// نستورد بيانات التست (مسارات الصفحات).
import { paths } from '../../../test-data/test-data';

// Page Object لصفحة كتالوج الأدوات "الأدوات" (SRS 10.8).
// الصفحة بتعرض كارت لكل أداة: فيه شارة (badge)، الاسم، وصف قصير،
// زرار معاينة (أيقونة العين)، وزرار "إضافة الأداة" (أو "مضافة بالفعل" لو الأداة متضافة قبل كده).
export class ToolsCatalogPage {
  // التاب (الصفحة) بتاعة المتصفح.
  readonly page: Page;
  // عنوان الصفحة "الأدوات".
  readonly heading: Locator;
  // خانة البحث "قم بالبحث باسم الأداة".
  readonly searchInput: Locator;
  // القايمة المنسدلة للشارات ("جميع الوسوم").
  readonly badgeFilter: Locator;
  // زرار "مسح الفلاتر" (بيظهر لما يكون في فلتر أو بحث شغّال).
  readonly clearFiltersButton: Locator;
  // كل كروت الأدوات.
  readonly cards: Locator;
  // أسماء الأدوات (عنوان واحد في كل كارت).
  readonly cardNames: Locator;
  // كل أزرار "إضافة الأداة".
  readonly addButtons: Locator;
  // كل أزرار "مضافة بالفعل".
  readonly addedButtons: Locator;

  // بنبني الـ Page Object.
  constructor(page: Page) {
    // نحفظ التاب.
    this.page = page;
    // العنوان: الـ h1 بتاع الصفحة.
    this.heading = page.getByRole('heading', { level: 1, name: 'الأدوات', exact: true });
    // خانة البحث: بنلاقيها من الـ placeholder بتاعها.
    this.searchInput = page.getByPlaceholder('قم بالبحث باسم الأداة');
    // القايمة المنسدلة للشارات: هي الـ combobox الوحيد في الصفحة.
    this.badgeFilter = page.getByRole('combobox');
    // زرار مسح الفلاتر: بنلاقيه باسمه العربي.
    this.clearFiltersButton = page.getByRole('button', { name: 'مسح الفلاتر' });
    // الكروت: كل أداة هي عنصر <article>.
    this.cards = page.locator('article');
    // الأسماء: الـ h2 جوه كل كارت.
    this.cardNames = this.cards.getByRole('heading', { level: 2 });
    // الأزرار: بنلاقيها بأسمائها العربي.
    this.addButtons = this.cards.getByRole('button', { name: 'إضافة الأداة' });
    this.addedButtons = this.cards.getByRole('button', { name: 'مضافة بالفعل' });
  }

  // نفتح صفحة الكتالوج.
  async open() {
    // نروح لـ BASE_URL + /ar/tools. بنستنى تحميل الـ HTML بس لأن الصفحة بطيئة في التحميل.
    await this.page.goto(paths.tools, { waitUntil: 'domcontentloaded' });
    // نستنى لحد ما أول كارت يظهر.
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
    // نفتح القايمة.
    await this.badgeFilter.click();
    // نضغط على الاختيار.
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
