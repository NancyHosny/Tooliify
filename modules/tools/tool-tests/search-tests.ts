import { test, expect } from '../../shared/bug-capture';
import { ToolsCatalogPage } from '../pages/ToolsCatalogPage';
import { ToolData, catalogTabs, messages } from '../../../test-data/test-data';

// تستات "البحث" لأداة واحدة: هل بحث الكتالوج بيلاقيها، وهل بيظهر شاشة "مفيش نتايج" لاسم غلط.
// كل فولدر أداة بينده الدالة دي من ملف search.spec.ts بتاعه.
export function searchTests(tool: ToolData) {
  test.describe(`${tool.name} – search`, () => {
    let catalog: ToolsCatalogPage;

    // قبل كل تست: نفتح الكتالوج.
    test.beforeEach(async ({ page }) => {
      catalog = new ToolsCatalogPage(page);
      await catalog.open();
    });

    // الاسم الكامل بيلاقي الأداة.
    test('search by the full name finds the tool', { tag: '@smoke' }, async ({ page }) => {
      await catalog.search(tool.name);
      await expect(page).toHaveURL(/search=/);
      await expect(catalog.card(tool.name)).toBeVisible();
    });

    // أول 3 حروف بتلاقي الأداة.
    test('search by part of the name finds the tool', { tag: '@regression' }, async () => {
      await catalog.search(tool.name.slice(0, 3));
      await expect(catalog.card(tool.name)).toBeVisible();
    });

    // المسافات حوالين الاسم بتتجاهل.
    test('search ignores spaces around the name', { tag: '@regression' }, async () => {
      await catalog.search(`  ${tool.name}  `);
      await expect(catalog.card(tool.name)).toBeVisible();
    });

    // الأداة لسه بتتلاقي جوه تاب التصنيف بتاعها.
    test('search finds the tool inside its category tab', { tag: '@regression' }, async () => {
      const tab = catalogTabs.find((item) => item.categoryId === tool.categoryId)!.tab;
      await catalog.search(tool.name);
      await catalog.tab(tab).click();
      await expect(catalog.card(tool.name)).toBeVisible();
    });

    // اسم غلط بيظهر شاشة "مفيش نتايج".
    test('search with a wrong name shows the empty state', { tag: '@regression' }, async ({ page }) => {
      await catalog.search(`${tool.name} zzzqqq`);
      await expect(catalog.cards).toHaveCount(0);
      await expect(page.getByText(messages.noToolsFound)).toBeVisible();
      await expect(catalog.clearFiltersButton).toBeVisible();
    });
  });
}
