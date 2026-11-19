import { test, expect } from '../../shared/bug-capture';
import { ToolsCatalogPage } from '../pages/ToolsCatalogPage';
import { ToolBuilderPage } from '../pages/ToolBuilderPage';
import { MyToolsPage } from '../pages/MyToolsPage';
import { ToolData, newQaToolName, messages } from '../../../test-data/test-data';

// تستات "الحذف" لأداة واحدة (SRS 10.10). قبل كل تست بنضيف أداة QA،
// وبعد كل تست بنحذف أي أداة QA فاضلة. كل فولدر أداة بينده الدالة دي من ملف delete.spec.ts بتاعه.
export function deleteTests(tool: ToolData) {
  test.describe(`${tool.name} – delete`, () => {
    // الحفظ بطيء على staging، فالتستات دي ممكن تاخد أكتر من الـ 30 ثانية العادية.
    test.describe.configure({ timeout: 120_000 });

    let catalog: ToolsCatalogPage;
    let builder: ToolBuilderPage;
    let myTools: MyToolsPage;
    let name = '';

    // قبل كل تست: نضيف أداة QA ونفتح "أدواتي".
    test.beforeEach(async ({ page }) => {
      catalog = new ToolsCatalogPage(page);
      builder = new ToolBuilderPage(page);
      myTools = new MyToolsPage(page);
      name = newQaToolName(tool.slug);
      await builder.addAndWait(tool, name);
      await myTools.open();
      await expect(myTools.row(name)).toBeVisible();
    });

    // بعد كل تست: نحذف أي أداة QA فاضلة.
    test.afterEach(async () => {
      await myTools.deleteQaToolsFromPage();
    });

    // نافذة الحذف بتعرض اسم الأداة والتحذير.
    test('delete popup shows the tool name and a warning', { tag: '@regression' }, async () => {
      await myTools.deleteButton(name).click();
      await expect(myTools.deleteDialog.getByText(messages.deleteToolTitle)).toBeVisible();
      await expect(myTools.deleteDialog.getByText(name)).toBeVisible();
      await expect(myTools.deleteDialog.getByText(messages.deleteToolQuestion)).toBeVisible();
      await expect(myTools.confirmDeleteButton).toBeVisible();
      await expect(myTools.closeDeleteButton).toBeVisible();
    });

    // "إغلاق" بيسيب الأداة زي ما هي.
    test('"إغلاق" in the delete popup keeps the tool', { tag: '@regression' }, async () => {
      await myTools.deleteButton(name).click();
      await myTools.closeDeleteButton.click();
      await expect(myTools.deleteDialog).toBeHidden();
      await expect(myTools.row(name)).toBeVisible();
      await myTools.open();
      await expect(myTools.row(name)).toBeVisible();
    });

    // تأكيد الحذف بيشيل الأداة من القايمة فورًا.
    test('confirmed delete closes the popup and removes the row', { tag: '@smoke' }, async () => {
      await myTools.deleteButton(name).click();
      await myTools.confirmDeleteButton.click();
      await expect(myTools.deleteDialog).toBeHidden({ timeout: 30_000 });
      await expect(myTools.row(name)).toHaveCount(0);
    });

    // بعد الحذف الأداة بتتمسح فعلًا (من السيرفر) وممكن تتضاف تاني.
    test('deleted tool is gone after reload and the catalog offers it again', { tag: '@smoke' }, async ({ page }) => {
      // الأداة اللي ليها نسخة حقيقية الكتالوج بيفضل يقول عليها "مضافة بالفعل".
      test.skip(Boolean(tool.realInstance), 'the account has a real copy of this tool, so the card keeps saying "مضافة بالفعل"');
      const before = await myTools.addedCount();
      await myTools.deleteButton(name).click();
      await myTools.confirmDeleteButton.click();
      await page.waitForTimeout(3000);
      await myTools.open();
      await expect(myTools.row(name)).toHaveCount(0);
      expect(await myTools.addedCount()).toBe(before - 1);
      await catalog.open();
      await expect(catalog.addButton(tool.name)).toBeVisible();
    });
  });
}
