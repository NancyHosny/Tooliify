// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Objects.
import { ToolsCatalogPage } from '../pages/ToolsCatalogPage';
import { ToolPreviewModal } from '../pages/ToolPreviewModal';
// نستورد عملاء الـ API (بنستخدمهم في مقارنة الواجهة بالـ API).
import { AuthClient } from '../../auth/clients/AuthClient';
import { ToolsCatalogClient } from '../clients/ToolsCatalogClient';
// نستورد بيانات التست.
import {
  apiUrl, paths, validMerchant, allToolsTab, catalogTabs, allBadgesOption, catalogBadges, sampleTool, messages,
} from '../../../test-data/test-data';

// تستات كتالوج الأدوات (SRS 10.8). بتشتغل في project اسمه "ui-merchant": التاجر بيبقى عامل تسجيل دخول جاهز.
// مفيش حاجة بتتضاف أو بتتحفظ هنا: "إضافة الأداة" بتفتح صفحة الـ builder بس.

// تستات بتفحص الصفحة زي ما بتتحمّل.
test.describe('Tools catalog – view (SRS 10.8)', () => {
  // الـ Page Object، بيتعمل من جديد لكل تست.
  let catalog: ToolsCatalogPage;

  // قبل كل تست: نفتح الكتالوج.
  test.beforeEach(async ({ page }) => {
    catalog = new ToolsCatalogPage(page);
    await catalog.open();
  });

  // الصفحة بتعرض العنوان وكروت الأدوات.
  test('catalog shows the title and tool cards', { tag: '@smoke' }, async () => {
    // المتوقع: العنوان "الأدوات".
    await expect(catalog.heading).toBeVisible();
    // المتوقع: كارت أداة واحد على الأقل.
    expect(await catalog.cards.count()).toBeGreaterThan(0);
  });

  // كل كارت فيه اسم وزرار معاينة وزرار إضافة (أو "مضافة بالفعل").
  test('every card has a name, a preview button and an add button', { tag: '@regression' }, async () => {
    // نعدّ الكروت.
    const total = await catalog.cards.count();
    // المتوقع: عدد الأسماء وأزرار المعاينة بعدد الكروت.
    expect(await catalog.cardNames.count()).toBe(total);
    expect(await catalog.cards.getByRole('button', { name: 'معاينة الأداة' }).count()).toBe(total);
    // المتوقع: كل كارت فيه "إضافة الأداة" أو "مضافة بالفعل".
    expect((await catalog.addButtons.count()) + (await catalog.addedButtons.count())).toBe(total);
  });

  // كل كارت بيعرض شارة واحدة بالظبط من القايمة المعروفة.
  test('every card shows one known badge', { tag: '@regression' }, async () => {
    // نعدّ الكروت.
    const total = await catalog.cards.count();
    // نفحص كل كارت.
    for (let i = 0; i < total; i++) {
      // نقرا نص الشارة بتاعة الكارت ده.
      const badges = await catalog.badgeOf(catalog.cards.nth(i)).allInnerTexts();
      // المتوقع: شارة واحدة بالظبط، وهي واحدة من الشارات المعروفة.
      expect(badges, `card #${i + 1}`).toHaveLength(1);
      expect(catalogBadges, `card #${i + 1}`).toContain(badges[0].trim());
    }
  });

  // تاب "الكل" متحدد افتراضيًا، والقايمة المنسدلة بتعرض "جميع الوسوم".
  test('"الكل" tab and "جميع الوسوم" are the default filters', { tag: '@regression' }, async () => {
    // المتوقع: تاب "الكل" متحدد.
    await expect(catalog.tab(allToolsTab)).toHaveAttribute('aria-selected', 'true');
    // المتوقع: القايمة بتعرض الاختيار الافتراضي.
    await expect(catalog.badgeFilter).toHaveText(allBadgesOption);
    // المتوقع: خانة البحث فاضية.
    await expect(catalog.searchInput).toHaveValue('');
  });

  // الأداة المتضافة بتعرض "مضافة بالفعل" بدل "إضافة الأداة".
  test('already added tool shows "مضافة بالفعل"', { tag: '@regression' }, async () => {
    // نتخطى لو الحساب مفيهوش أدوات متضافة.
    test.skip((await catalog.addedButtons.count()) === 0, 'no tool is added on this account');
    // أول كارت فيه "مضافة بالفعل".
    const card = catalog.cards.filter({ has: catalog.addedButtons.first() });
    // المتوقع: الكارت ده مفيهوش زرار "إضافة الأداة".
    await expect(card.getByRole('button', { name: 'إضافة الأداة' })).toHaveCount(0);
  });
});

// تابات التصنيفات.
test.describe('Tools catalog – category tabs (SRS 10.8)', () => {
  // الـ Page Object، بيتعمل من جديد لكل تست.
  let catalog: ToolsCatalogPage;

  // قبل كل تست: نفتح الكتالوج.
  test.beforeEach(async ({ page }) => {
    catalog = new ToolsCatalogPage(page);
    await catalog.open();
  });

  // تست لكل تاب: بيتحدد وبيعرض أداته.
  for (const item of catalogTabs) {
    test(`tab "${item.tab}" shows its tools`, { tag: '@regression' }, async () => {
      // نفتكر كام أداة بيعرض تاب "الكل".
      const all = await catalog.cards.count();
      // نضغط على التاب.
      await catalog.tab(item.tab).click();
      // المتوقع: التاب متحدد.
      await expect(catalog.tab(item.tab)).toHaveAttribute('aria-selected', 'true');
      // المتوقع: الأداة النموذجية بتاعة التصنيف ده ظاهرة.
      await expect(catalog.card(item.tool)).toBeVisible();
      // المتوقع: عدد أقل من تاب "الكل" (يعني التاب بيفلتر فعلًا).
      expect(await catalog.cards.count()).toBeLessThan(all);
    });
  }

  // كل أداة تابعة لتاب واحد بالظبط (مجموع أعداد التابات بيساوي "الكل").
  test('tab counts add up to the "الكل" count', { tag: '@regression' }, async () => {
    // نعدّ الأدوات في "الكل".
    const all = await catalog.cards.count();
    // نجمع أعداد كل تابات التصنيفات.
    let sum = 0;
    for (const item of catalogTabs) {
      await catalog.tab(item.tab).click();
      await expect(catalog.tab(item.tab)).toHaveAttribute('aria-selected', 'true');
      sum += await catalog.cards.count();
    }
    // المتوقع: نفس الرقم.
    expect(sum).toBe(all);
  });

  // الرجوع لتاب "الكل" بيعرض كل الأدوات تاني.
  test('"الكل" shows every tool again after a category', { tag: '@regression' }, async () => {
    // نفتكر القايمة الكاملة.
    const all = await catalog.names();
    // نفتح تصنيف وبعدين "الكل" تاني.
    await catalog.tab(catalogTabs[0].tab).click();
    await expect(catalog.tab(catalogTabs[0].tab)).toHaveAttribute('aria-selected', 'true');
    await catalog.tab(allToolsTab).click();
    // المتوقع: نفس القايمة اللي قبل كده.
    await expect(catalog.cardNames).toHaveText(all);
  });
});

// القايمة المنسدلة للشارات ("جميع الوسوم").
test.describe('Tools catalog – badge filter (SRS 10.8)', () => {
  // الـ Page Object، بيتعمل من جديد لكل تست.
  let catalog: ToolsCatalogPage;

  // قبل كل تست: نفتح الكتالوج.
  test.beforeEach(async ({ page }) => {
    catalog = new ToolsCatalogPage(page);
    await catalog.open();
  });

  // تست لكل شارة: بيفضل الكروت اللي عليها الشارة دي بس.
  for (const badge of catalogBadges) {
    test(`badge filter "${badge}" shows only those tools`, { tag: '@regression' }, async ({ page }) => {
      // نعدّ الكروت اللي عليها الشارة دي قبل الفلترة.
      const expectedCount = await catalog.cardsWithBadge(badge).count();
      // نختار الشارة.
      await catalog.selectBadge(badge);
      // المتوقع: القايمة بتعرض الشارة والعنوان فيه ?filter=.
      await expect(catalog.badgeFilter).toHaveText(badge);
      await expect(page).toHaveURL(/filter=/);
      // المتوقع: نفس عدد الكروت من قبل، وكلها عليها الشارة.
      await expect(catalog.cards).toHaveCount(expectedCount);
      await expect(catalog.cardsWithBadge(badge)).toHaveCount(expectedCount);
    });
  }

  // "مسح الفلاتر" بيشيل فلتر الشارة.
  test('"مسح الفلاتر" resets the badge filter', { tag: '@regression' }, async ({ page }) => {
    // نفتكر العدد الكامل.
    const all = await catalog.cards.count();
    // نختار شارة وبعدين نمسح.
    await catalog.selectBadge(catalogBadges[0]);
    await expect(page).toHaveURL(/filter=/);
    await catalog.clearFiltersButton.click();
    // المتوقع: الاختيار الافتراضي، ومفيش ?filter=، وكل الكروت رجعت.
    await expect(catalog.badgeFilter).toHaveText(allBadgesOption);
    await expect(page).not.toHaveURL(/filter=/);
    await expect(catalog.cards).toHaveCount(all);
  });
});

// نافذة المعاينة وزرار الإضافة (مفيش أداة بتتحفظ).
test.describe('Tools catalog – preview and add (SRS 10.8)', () => {
  // الـ Page Objects، بتتعمل من جديد لكل تست.
  let catalog: ToolsCatalogPage;
  let preview: ToolPreviewModal;

  // قبل كل تست: نفتح الكتالوج.
  test.beforeEach(async ({ page }) => {
    catalog = new ToolsCatalogPage(page);
    preview = new ToolPreviewModal(page);
    await catalog.open();
  });

  // زرار العين بيفتح نافذة المعاينة وفيها اسم الأداة.
  test('preview popup opens and closes', { tag: '@smoke' }, async () => {
    // نضغط زرار العين بتاع الأداة النموذجية.
    await catalog.previewButton(sampleTool.name).click();
    // المتوقع: النافذة فيها اسم الأداة ونص "المعاينة ستتوفر قريباً".
    await expect(preview.title(sampleTool.name)).toBeVisible();
    await expect(preview.dialog.getByText(messages.previewSoon)).toBeVisible();
    // نقفلها.
    await preview.closeButton.click();
    // المتوقع: النافذة اختفت.
    await expect(preview.dialog).toBeHidden();
  });

  // "إضافة الأداة" على الكارت بتفتح صفحة الـ builder.
  test('"إضافة الأداة" opens the tool builder page', { tag: '@smoke' }, async ({ page }) => {
    // نضغط زرار الإضافة بتاع الأداة النموذجية.
    await catalog.addButton(sampleTool.name).click();
    // المتوقع: صفحة الـ builder بتاعة الأداة دي، وعنوانها ظاهر.
    await expect(page).toHaveURL(new RegExp(`${paths.tools}/${sampleTool.slug}$`));
    await expect(page.getByRole('heading', { name: `${messages.customizeTool} ${sampleTool.name}` })).toBeVisible();
  });

  // "إضافة الأداة" جوه النافذة بتفتح نفس صفحة الـ builder.
  test('popup "إضافة الأداة" opens the tool builder page', { tag: '@regression' }, async ({ page }) => {
    // نفتح النافذة ونضغط زرار الإضافة اللي فيها.
    await catalog.previewButton(sampleTool.name).click();
    await preview.addButton.click();
    // المتوقع: صفحة الـ builder بتاعة الأداة دي.
    await expect(page).toHaveURL(new RegExp(`${paths.tools}/${sampleTool.slug}$`));
  });
});

// التحكم في الوصول.
test.describe('Tools catalog – access (SRS 10.8)', () => {
  // الجزء ده بيشتغل من غير الجلسة المحفوظة (cookies فاضية = زائر مش عامل تسجيل دخول).
  test.use({ storageState: { cookies: [], origins: [] } });

  // الزائر اللي مش عامل تسجيل دخول مينفعش يفتح الكتالوج.
  test('catalog is not accessible without login', { tag: '@regression' }, async ({ page }) => {
    // نحاول نفتح الكتالوج مباشرة (التحويل بيحصل في الـ client بعد فحص الجلسة، فهو بطيء).
    await page.goto(paths.tools, { waitUntil: 'networkidle' });
    // المتوقع: تحويل لصفحة تسجيل الدخول، والكتالوج هو عنوان الرجوع (callbackUrl).
    await expect(page).toHaveURL(/\/auth\?.*callbackUrl=%2Far%2Ftools/, { timeout: 30_000 });
  });
});

// مقارنة الواجهة بالـ API (بتتخطى لحد ما API_URL يتكتب في ملف .env).
test.describe('Tools catalog – UI matches API (SRS 10.8)', () => {
  // نتخطى كل التستات لو API_URL مش مكتوب.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // الـ Page Object وعميل الـ API.
  let catalog: ToolsCatalogPage;
  let api: ToolsCatalogClient;

  // قبل كل تست: نفتح الكتالوج ونعمل عميل الـ API.
  test.beforeEach(async ({ page, playwright }) => {
    // نفتح الصفحة.
    catalog = new ToolsCatalogPage(page);
    await catalog.open();
    // request context موجّه للـ API، بتوكن جديد.
    const request = await playwright.request.newContext({ baseURL: apiUrl });
    const token = await new AuthClient(request).getToken(validMerchant.email, validMerchant.password);
    api = new ToolsCatalogClient(request, token);
  });

  // الصفحة بتعرض نفس الأدوات اللي بيرجّعها GET /tools.
  test('page shows the same tools as the API', { tag: '@regression' }, async () => {
    // نقرا الأدوات من الـ API.
    const tools = (await (await api.listTools()).json()).data as { name: string; is_added: boolean }[];
    // المتوقع: نفس الأسماء بنفس الترتيب.
    await expect(catalog.cardNames).toHaveText(tools.map((t) => t.name));
    // المتوقع: عدد أزرار "مضافة بالفعل" بعدد الأدوات اللي is_added = true.
    await expect(catalog.addedButtons).toHaveCount(tools.filter((t) => t.is_added).length);
  });

  // في تاب لكل تصنيف في الـ API (+ "الكل").
  test('tabs count matches the API categories', { tag: '@regression' }, async () => {
    // نقرا التصنيفات من الـ API.
    const categories = (await (await api.listCategories()).json()).data as { id: number; name: string }[];
    // المتوقع: التصنيفات + "الكل".
    await expect(catalog.page.getByRole('tab')).toHaveCount(categories.length + 1);
  });

  // كل تاب بيعرض أدوات تصنيفه من الـ API بالظبط (أسماء التابات بتختلف عن أسماء الـ API قصدًا).
  for (const item of catalogTabs) {
    test(`tab "${item.tab}" shows the tools of API category ${item.categoryId}`, { tag: '@regression' }, async () => {
      // نقرا أدوات التصنيف من الـ API.
      const tools = (await (await api.listCategoryTools(item.categoryId)).json()).data as { name: string }[];
      // نفتح التاب.
      await catalog.tab(item.tab).click();
      // المتوقع: نفس الأدوات بنفس الترتيب.
      await expect(catalog.cardNames).toHaveText(tools.map((t) => t.name));
    });
  }
});
