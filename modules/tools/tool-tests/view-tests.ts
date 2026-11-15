// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Objects.
import { ToolsCatalogPage } from '../pages/ToolsCatalogPage';
import { ToolPreviewModal } from '../pages/ToolPreviewModal';
import { ToolBuilderPage } from '../pages/ToolBuilderPage';
// نستورد بيانات التست.
import { ToolData, catalogTabs, paths, messages } from '../../../test-data/test-data';

// تستات "العرض" لأداة واحدة: الكارت بتاعها في الكتالوج، نافذة المعاينة، وصفحة الـ builder.
// مفيش حاجة بتتحفظ هنا. كل فولدر أداة بينده الدالة دي من ملف view.spec.ts بتاعه.
export function viewTests(tool: ToolData) {
  test.describe(`${tool.name} – view`, () => {
    // الـ Page Objects، بتتعمل من جديد لكل تست.
    let catalog: ToolsCatalogPage;
    let preview: ToolPreviewModal;
    let builder: ToolBuilderPage;

    // قبل كل تست: نعمل الـ Page Objects ونفتح الكتالوج.
    test.beforeEach(async ({ page }) => {
      catalog = new ToolsCatalogPage(page);
      preview = new ToolPreviewModal(page);
      builder = new ToolBuilderPage(page);
      await catalog.open();
    });

    // الكارت بيعرض الاسم وزرار المعاينة وواحد من الزرارين "إضافة الأداة" / "مضافة بالفعل".
    test('card shows the name, a preview button and an add button', { tag: '@smoke' }, async () => {
      // المتوقع: الكارت وزرار المعاينة وزرار الإضافة (أو "مضافة بالفعل") ظاهرين.
      await expect(catalog.card(tool.name)).toBeVisible();
      await expect(catalog.previewButton(tool.name)).toBeVisible();
      await expect(catalog.card(tool.name).getByRole('button', { name: /إضافة الأداة|مضافة بالفعل/ })).toBeVisible();
    });

    // الأداة بتظهر جوه تاب التصنيف بتاعها.
    test('tool is shown inside its category tab', { tag: '@regression' }, async () => {
      // تاب تصنيف الأداة.
      const tab = catalogTabs.find((item) => item.categoryId === tool.categoryId)!.tab;
      // نفتح التاب.
      await catalog.tab(tab).click();
      // المتوقع: التاب بقى متحدد والأداة ظاهرة.
      await expect(catalog.tab(tab)).toHaveAttribute('aria-selected', 'true');
      await expect(catalog.card(tool.name)).toBeVisible();
    });

    // زرار العين بيفتح نافذة المعاينة وفيها اسم الأداة.
    test('preview popup opens and closes', { tag: '@regression' }, async () => {
      // نضغط زرار العين بتاع الأداة.
      await catalog.previewButton(tool.name).click();
      // المتوقع: النافذة فيها اسم الأداة ونص "المعاينة ستتوفر قريباً".
      await expect(preview.title(tool.name)).toBeVisible();
      await expect(preview.dialog.getByText(messages.previewSoon)).toBeVisible();
      // نقفلها.
      await preview.closeButton.click();
      // المتوقع: النافذة اختفت.
      await expect(preview.dialog).toBeHidden();
    });

    // زرار "إضافة الأداة" على الكارت بيفتح صفحة الـ builder بتاعة الأداة.
    test('"إضافة الأداة" opens the tool builder page', { tag: '@smoke' }, async ({ page }) => {
      // الأداة المتضافة بالفعل مفيهاش زرار "إضافة الأداة"، فنتخطى التست.
      test.skip((await catalog.addButton(tool.name).count()) === 0, 'the tool is already added on the account');
      // نضغط زرار الإضافة.
      await catalog.addButton(tool.name).click();
      // المتوقع: صفحة الـ builder بتاعة الأداة دي.
      await expect(page).toHaveURL(new RegExp(`${paths.tools}/${tool.slug}$`));
      await expect(builder.heading(tool.name)).toBeVisible();
    });

    // صفحة الـ builder (بفتحها بعنوانها) بتعرض العنوان واسم افتراضي وزرار الحفظ.
    test('builder page shows the heading, a default name and the save button', { tag: '@regression' }, async () => {
      // نفتح الـ builder مباشرة.
      await builder.open(tool.slug);
      // المتوقع: العنوان، اسم افتراضي مش فاضي، وزرارين الحفظ والرجوع.
      await expect(builder.heading(tool.name)).toBeVisible();
      await expect(builder.nameInput).not.toHaveValue('');
      await expect(builder.saveButton).toBeVisible();
      await expect(builder.backButton).toBeVisible();
    });
  });
}
