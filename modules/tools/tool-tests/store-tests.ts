// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Objects وعميل الاستور.
import { ToolBuilderPage } from '../pages/ToolBuilderPage';
import { MyToolsPage } from '../pages/MyToolsPage';
import { StorePage } from '../pages/StorePage';
import { StoreClient } from '../clients/StoreClient';
// نستورد بيانات التست.
import { ToolData, paths, newQaToolName, storeMarker } from '../../../test-data/test-data';

// تستات "الاستور" لأداة واحدة: هل الأداة بتوصل فعلًا لمتجر التاجر؟
// بنكتب قيمة مميزة في الـ builder، وبعدين بندوّر عليها في الملف العام اللي المتجر بيحمّله
// (المتجر بيرسم الأدوات المفعّلة من الملف ده)، وفي صفحة المتجر نفسها للأدوات اللي بتترسم عند تحميل الصفحة.
// كل أداة بتتعمل هنا اسمها بيبدأ بـ "QA-" وبتتحذف بعد التست.
// كل فولدر أداة بينده الدالة دي من ملف store.spec.ts بتاعه.
export function storeTests(tool: ToolData) {
  test.describe(`${tool.name} – store`, () => {
    // الأداة اللي مفيش ليها حقل متربط للاستور مفيش حاجة نندوّر عليها.
    test.skip(!tool.storeField, 'no builder field is mapped for the store check of this tool yet');
    // الحفظ والنشر وتحميل المتجر الحقيقي بطيئين، فالتستات دي ممكن تاخد أكتر بكتير من الـ 30 ثانية.
    test.describe.configure({ timeout: 300_000 });

    // الـ Page Objects وعميل الاستور والقيم اللي التست بيستخدمها.
    let builder: ToolBuilderPage;
    let myTools: MyToolsPage;
    let storePage: StorePage;
    const storeFile = new StoreClient();
    let name = '';
    let first = { value: '', needle: '' };

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
      await myTools.deleteQaTools();
    });

    // ملف الاستور فيه القيمة المميزة بعد إضافة الأداة.
    test('added tool reaches the store file', { tag: '@smoke' }, async () => {
      // المتوقع: القيمة المميزة موجودة في الملف العام (بيتعاد كتابته بعد الحفظ بكام ثانية).
      await expect.poll(() => storeFile.scriptHas(first.needle), { timeout: 90_000, intervals: [3_000] }).toBe(true);
    });

    // الأدوات اللي بتترسم عند تحميل الصفحة: صفحة المتجر نفسها لازم تعرض القيمة المميزة.
    test('added tool is shown on the store page', { tag: '@smoke' }, async () => {
      test.skip(!tool.shownOnLoad, 'this tool is not drawn when the store page loads (it appears after a visitor action)');
      // نستنى لحد ما الملف يبقى فيه القيمة وبعدين نفتح المتجر.
      await expect.poll(() => storeFile.scriptHas(first.needle), { timeout: 90_000, intervals: [3_000] }).toBe(true);
      await storePage.open();
      // المتوقع: صفحة المتجر فيها القيمة المميزة (بنعمل reload للصفحة لحد ما تظهر).
      expect(await storePage.waitUntilContains(first.needle, 120)).toBe(true);
    });

    // تعديل الأداة بيبدّل القيمة في ملف الاستور.
    test('edited tool updates the store file', { tag: '@regression' }, async ({ page }) => {
      // نغيّر القيمة المميزة في صفحة التعديل ونحفظ.
      const second = storeMarker(tool, 'qae');
      await builder.saveStoreValue(tool, second.value);
      await expect(page).toHaveURL(new RegExp(`${paths.myTools}$`), { timeout: 60_000 });
      // المتوقع: القيمة الجديدة موجودة في الملف والقديمة اختفت.
      await expect.poll(() => storeFile.scriptHas(second.needle), { timeout: 90_000, intervals: [3_000] }).toBe(true);
      expect(await storeFile.scriptHas(first.needle)).toBe(false);
    });

    // حذف الأداة بيشيل قيمتها من ملف الاستور.
    test('deleted tool is removed from the store file', { tag: '@regression' }, async () => {
      // الأول نتأكد إن القيمة وصلت للملف.
      await expect.poll(() => storeFile.scriptHas(first.needle), { timeout: 90_000, intervals: [3_000] }).toBe(true);
      // نحذف الأداة من "أدواتي".
      await myTools.open();
      await myTools.deleteButton(name).click();
      await myTools.confirmDeleteButton.click();
      await expect(myTools.deleteDialog).toBeHidden({ timeout: 30_000 });
      // المتوقع: القيمة مبقتش موجودة في الملف.
      await expect.poll(() => storeFile.scriptHas(first.needle), { timeout: 90_000, intervals: [3_000] }).toBe(false);
    });
  });
}
