import { test, expect } from '../../shared/bug-capture';
import { ToolsCatalogPage } from '../pages/ToolsCatalogPage';
import { ToolPreviewModal } from '../pages/ToolPreviewModal';
import { ToolBuilderPage } from '../pages/ToolBuilderPage';
import { ToolData, catalogTabs, paths, messages } from '../../../test-data/test-data';

// تستات "العرض" لأداة واحدة: الكارت بتاعها في الكتالوج، نافذة المعاينة، وصفحة الـ builder.
// مفيش حاجة بتتحفظ هنا. كل فولدر أداة بينده الدالة دي من ملف view.spec.ts بتاعه.
export function viewTests(tool: ToolData) {
  test.describe(`${tool.name} – view`, () => {
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
      await expect(catalog.card(tool.name)).toBeVisible();
      await expect(catalog.previewButton(tool.name)).toBeVisible();
      await expect(catalog.card(tool.name).getByRole('button', { name: /إضافة الأداة|مضافة بالفعل/ })).toBeVisible();
    });

    // الأداة بتظهر جوه تاب التصنيف بتاعها.
    test('tool is shown inside its category tab', { tag: '@regression' }, async () => {
      const tab = catalogTabs.find((item) => item.categoryId === tool.categoryId)!.tab;
      await catalog.tab(tab).click();
      await expect(catalog.tab(tab)).toHaveAttribute('aria-selected', 'true');
      await expect(catalog.card(tool.name)).toBeVisible();
    });

    // زرار العين بيفتح نافذة المعاينة وفيها اسم الأداة.
    test('preview popup opens and closes', { tag: '@regression' }, async () => {
      await catalog.previewButton(tool.name).click();
      await expect(preview.title(tool.name)).toBeVisible();
      await expect(preview.dialog.getByText(messages.previewSoon)).toBeVisible();
      await preview.closeButton.click();
      await expect(preview.dialog).toBeHidden();
    });

    // زرار "إضافة الأداة" على الكارت بيفتح صفحة الـ builder بتاعة الأداة.
    test('"إضافة الأداة" opens the tool builder page', { tag: '@smoke' }, async ({ page }) => {
      // الأداة المتضافة بالفعل مفيهاش زرار "إضافة الأداة"، فنتخطى التست.
      test.skip((await catalog.addButton(tool.name).count()) === 0, 'the tool is already added on the account');
      await catalog.addButton(tool.name).click();
      await expect(page).toHaveURL(new RegExp(`${paths.tools}/${tool.slug}$`));
      await expect(builder.heading(tool.name)).toBeVisible();
    });

    // صفحة الـ builder (بفتحها بعنوانها) بتعرض العنوان واسم افتراضي وزرار الحفظ.
    test('builder page shows the heading, a default name and the save button', { tag: '@regression' }, async () => {
      await builder.open(tool.slug);
      await expect(builder.heading(tool.name)).toBeVisible();
      await expect(builder.nameInput).not.toHaveValue('');
      await expect(builder.saveButton).toBeVisible();
      await expect(builder.backButton).toBeVisible();
    });
  });
}
