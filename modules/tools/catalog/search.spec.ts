// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Object.
import { ToolsCatalogPage } from '../pages/ToolsCatalogPage';
// نستورد بيانات التست.
import { paths, validSearches, noResultSearches, searchWithoutMatchInTab, messages } from '../../../test-data/test-data';

// البحث في كتالوج الأدوات (SRS 10.8). الصفحة بتفلتر وإنت بتكتب وبتكتب ?search= في العنوان.
test.describe('Tools catalog – search (SRS 10.8)', () => {
  // الـ Page Object، بيتعمل من جديد لكل تست.
  let catalog: ToolsCatalogPage;

  // قبل كل تست: نفتح الكتالوج.
  test.beforeEach(async ({ page }) => {
    catalog = new ToolsCatalogPage(page);
    await catalog.open();
  });

  // تست لكل بحث صحيح (الاسم كامل، جزء منه، أو مسافات حواليه).
  for (const item of validSearches) {
    test(`search finds a tool: ${item.name}`, { tag: '@smoke' }, async ({ page }) => {
      // نكتب كلمة البحث.
      await catalog.search(item.term);
      // المتوقع: العنوان فيه ?search=.
      await expect(page).toHaveURL(/search=/);
      // المتوقع: الأداة ظاهرة وهي الكارت الوحيد.
      await expect(catalog.card(item.expected)).toBeVisible();
      await expect(catalog.cards).toHaveCount(1);
    });
  }

  // تست لكل بحث من غير نتيجة: شاشة "مفيش نتايج" بتظهر.
  for (const item of noResultSearches) {
    test(`search shows the empty state: ${item.name}`, { tag: '@regression' }, async ({ page }) => {
      // نكتب كلمة البحث.
      await catalog.search(item.term);
      // المتوقع: مفيش كروت، ونصوص الشاشة الفاضية وزرار المسح ظاهرين.
      await expect(catalog.cards).toHaveCount(0);
      await expect(page.getByText(messages.noToolsFound)).toBeVisible();
      await expect(page.getByText(messages.noToolsHint)).toBeVisible();
      await expect(catalog.clearFiltersButton).toBeVisible();
    });
  }

  // مسح خانة البحث بيعرض كل الأدوات تاني.
  test('clearing the search shows all tools again', { tag: '@regression' }, async ({ page }) => {
    // نفتكر العدد الكامل.
    const all = await catalog.cards.count();
    // نبحث وبعدين نمسح الخانة.
    await catalog.search(validSearches[0].term);
    await expect(catalog.cards).toHaveCount(1);
    await catalog.search('');
    // المتوقع: مفيش ?search= وكل الكروت رجعت.
    await expect(page).not.toHaveURL(/search=/);
    await expect(catalog.cards).toHaveCount(all);
  });

  // "مسح الفلاتر" في الشاشة الفاضية بيمسح البحث.
  test('"مسح الفلاتر" clears the search', { tag: '@regression' }, async () => {
    // نبحث عن حاجة مش موجودة.
    await catalog.search(noResultSearches[0].term);
    await expect(catalog.clearFiltersButton).toBeVisible();
    // نضغط زرار المسح.
    await catalog.clearFiltersButton.click();
    // المتوقع: الخانة فاضية والكروت رجعت.
    await expect(catalog.searchInput).toHaveValue('');
    await expect(catalog.cards.first()).toBeVisible();
  });

  // رابط فيه ?search= بيفتح الصفحة وهي متفلترة من الأول.
  test('link with ?search= opens the page filtered', { tag: '@regression' }, async ({ page }) => {
    // نفتح الكتالوج وكلمة البحث في العنوان.
    await page.goto(`${paths.tools}?search=${encodeURIComponent(validSearches[0].term)}`, { waitUntil: 'domcontentloaded' });
    // المتوقع: الخانة فيها الكلمة والأداة المطابقة بس هي الظاهرة.
    await expect(catalog.searchInput).toHaveValue(validSearches[0].term);
    await expect(catalog.card(validSearches[0].expected)).toBeVisible();
    await expect(catalog.cards).toHaveCount(1);
  });

  // البحث والتاب بيشتغلوا مع بعض: مفيش تطابق ← شاشة فاضية، والمسح ← الأدوات ترجع.
  test('search inside a tab with no match shows the empty state', { tag: '@regression' }, async ({ page }) => {
    // نبحث عن كلمة وبعدين نفتح تاب مفيهوش أداة بالاسم ده.
    await catalog.search(searchWithoutMatchInTab.term);
    await catalog.tab(searchWithoutMatchInTab.tab).click();
    // المتوقع: الشاشة الفاضية.
    await expect(catalog.cards).toHaveCount(0);
    await expect(page.getByText(messages.noToolsFound)).toBeVisible();
    // نمسح الفلاتر.
    await catalog.clearFiltersButton.click();
    // المتوقع: خانة البحث فاضية والكروت ظاهرة تاني.
    await expect(catalog.searchInput).toHaveValue('');
    await expect(catalog.cards.first()).toBeVisible();
  });
});
