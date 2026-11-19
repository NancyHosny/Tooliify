import { test, expect } from '../../shared/bug-capture';
import { ToolBuilderPage } from '../pages/ToolBuilderPage';
import { MyToolsPage } from '../pages/MyToolsPage';
import { StorePage } from '../pages/StorePage';
import { StoreClient } from '../clients/StoreClient';
import { ToolData, paths, newQaToolName, storeMarker, messages, storeWait } from '../../../test-data/test-data';

// تستات "الاستور" لأداة واحدة: السيكل كاملة. التاجر بيعمل حاجة في لوحة التحكم (إضافة / تعديل / حذف)،
// وبعدين التست بيفتح المتجر الحقيقي ويشوف هل وصلت. بنكتب قيمة مميزة في الـ builder وندوّر عليها في:
// "أدواتي"، والمتجر (الصفحة وسكريبت Tooliify)، والملف العام اللي المتجر بيرسم منه.
// أدوات QA اسمها بيبدأ بـ "QA-" وبتتحذف بعد التست. بيتنده من store.spec.ts في فولدر كل أداة.
export function storeTests(tool: ToolData) {
  test.describe(`${tool.name} – store`, () => {
    // الأداة اللي مفيش ليها حقل متربط للاستور مفيش حاجة نندوّر عليها.
    test.skip(!tool.storeField, 'no builder field is mapped for the store check of this tool yet');
    // الحفظ والنشر وتحميل المتجر الحقيقي بطيئين، فالتستات دي ممكن تاخد أكتر بكتير من الـ 30 ثانية.
    test.describe.configure({ timeout: 360_000 });

    let builder: ToolBuilderPage;
    let myTools: MyToolsPage;
    let storePage: StorePage;
    const storeFile = new StoreClient();
    let name = '';
    let first = { value: '', needle: '' };

    // دالة بتستنى لحد ما القيمة تبقى موجودة (أو مش موجودة) في الملف العام اللي المتجر بيحمّله.
    async function waitForFile(needle: string, present: boolean) {
      await expect.poll(() => storeFile.scriptHas(needle), { timeout: 90_000, intervals: [3_000] }).toBe(present);
    }

    // قبل كل تست: نضيف أداة QA فيها قيمة مميزة في حقل الاستور (والصفحة بعد كده بتبقى صفحة تعديلها).
    test.beforeEach(async ({ page }) => {
      builder = new ToolBuilderPage(page);
      myTools = new MyToolsPage(page);
      storePage = new StorePage(page);
      name = newQaToolName(tool.slug);
      first = storeMarker(tool, 'qas');
      await builder.addAndWait(tool, name, first.value);
    });

    // بعد كل تست: نحذف أي أداة QA فاضلة.
    test.afterEach(async () => {
      await myTools.deleteQaToolsFromPage();
    });

    // الإضافة: الأداة بتظهر في لوحة التحكم، وبعدين في المتجر.
    test('added tool appears in my tools and then in the store', { tag: '@smoke' }, async () => {
      await myTools.open();
      await expect(myTools.row(name)).toBeVisible();
      await expect(myTools.statusBadge(name)).toHaveText(messages.toolActive);
      await waitForFile(first.needle, true);
      await storePage.open();
      expect(await storePage.waitUntilContains(first.needle, storeWait.fileSeconds)).toBe(true);
    });

    // التعديل: القيمة الجديدة بتظهر في لوحة التحكم وفي المتجر، والقديمة بتختفي.
    test('edited tool shows the new value in my tools and in the store', { tag: '@regression' }, async ({ page }) => {
      const second = storeMarker(tool, 'qae');
      await builder.saveStoreValue(tool, second.value);
      await expect(page).toHaveURL(new RegExp(`${paths.myTools}$`), { timeout: 60_000 });
      await myTools.open();
      await expect(myTools.row(name)).toBeVisible();
      await expect(myTools.statusBadge(name)).toHaveText(messages.toolActive);
      await waitForFile(second.needle, true);
      await waitForFile(first.needle, false);
      await storePage.open();
      expect(await storePage.waitUntilContains(second.needle, storeWait.fileSeconds)).toBe(true);
      expect(await storePage.contains(first.needle)).toBe(false);
    });

    // الحذف: الأداة بتختفي من لوحة التحكم، وبعدين من المتجر.
    test('deleted tool disappears from my tools and from the store', { tag: '@regression' }, async () => {
      await waitForFile(first.needle, true);
      await storePage.open();
      expect(await storePage.waitUntilContains(first.needle, storeWait.fileSeconds)).toBe(true);
      await myTools.open();
      await myTools.deleteButton(name).click();
      await myTools.confirmDeleteButton.click();
      await expect(myTools.deleteDialog).toBeHidden({ timeout: 30_000 });
      await myTools.open();
      await expect(myTools.row(name)).toHaveCount(0);
      await waitForFile(first.needle, false);
      await storePage.open();
      expect(await storePage.waitUntilGone(first.needle, storeWait.fileSeconds)).toBe(true);
    });
  });
}
