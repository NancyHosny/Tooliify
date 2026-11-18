// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Objects وعميل الاستور.
import { ToolBuilderPage } from '../pages/ToolBuilderPage';
import { MyToolsPage } from '../pages/MyToolsPage';
import { StorePage } from '../pages/StorePage';
import { StoreClient } from '../clients/StoreClient';
// نستورد بيانات التست.
import { ToolData, paths, newQaToolName, storeMarker } from '../../../test-data/test-data';

// تستات "الاستور" لأداة واحدة: هل الأداة بتظهر فعلًا في متجر التاجر بعد الإضافة والتعديل والحذف؟
// بنكتب قيمة مميزة في الـ builder، وبعدين بندوّر عليها في مكانين:
//   1) الملف العام اللي المتجر بيحمّله (المتجر بيرسم الأدوات المفعّلة من الملف ده)، وده بيتعمل لكل الأدوات.
//   2) صفحة المتجر الحقيقية نفسها، للأدوات اللي بتترسم عند تحميل الصفحة (shownOnLoad). الباقي بيظهر بعد حركة من الزائر.
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
      await myTools.deleteQaTools();
    });

    // الأداة اللي اتضافت بتظهر في المتجر.
    test('added tool appears in the store', { tag: '@smoke' }, async () => {
      // المتوقع: القيمة المميزة موجودة في الملف العام (بيتعاد كتابته بعد الحفظ بكام ثانية).
      await waitForFile(first.needle, true);
      // المتوقع: لو الأداة بتترسم مع تحميل الصفحة، صفحة المتجر نفسها فيها القيمة (بنعمل reload لحد ما تظهر).
      if (tool.shownOnLoad) {
        await storePage.open();
        expect(await storePage.waitUntilContains(first.needle, 120)).toBe(true);
      }
    });

    // الأداة اللي اتعدّلت بتظهر في المتجر بقيمتها الجديدة.
    test('edited tool appears in the store with the new value', { tag: '@regression' }, async ({ page }) => {
      // نغيّر القيمة المميزة في صفحة التعديل ونحفظ.
      const second = storeMarker(tool, 'qae');
      await builder.saveStoreValue(tool, second.value);
      await expect(page).toHaveURL(new RegExp(`${paths.myTools}$`), { timeout: 60_000 });
      // المتوقع: القيمة الجديدة موجودة في الملف والقديمة اختفت.
      await waitForFile(second.needle, true);
      await waitForFile(first.needle, false);
      // المتوقع: لو الأداة بتترسم مع تحميل الصفحة، صفحة المتجر فيها القيمة الجديدة ومفيهاش القديمة.
      if (tool.shownOnLoad) {
        await storePage.open();
        expect(await storePage.waitUntilContains(second.needle, 120)).toBe(true);
        expect(await storePage.contains(first.needle)).toBe(false);
      }
    });

    // الأداة اللي اتحذفت بتختفي من المتجر.
    test('deleted tool disappears from the store', { tag: '@regression' }, async () => {
      // الأول نتأكد إن القيمة وصلت للملف.
      await waitForFile(first.needle, true);
      // نحذف الأداة من "أدواتي".
      await myTools.open();
      await myTools.deleteButton(name).click();
      await myTools.confirmDeleteButton.click();
      await expect(myTools.deleteDialog).toBeHidden({ timeout: 30_000 });
      // المتوقع: القيمة مبقتش موجودة في الملف.
      await waitForFile(first.needle, false);
      // المتوقع: لو الأداة بتترسم مع تحميل الصفحة، صفحة المتجر مبقتش فيها القيمة (بنعمل reload لحد ما تختفي).
      if (tool.shownOnLoad) {
        await storePage.open();
        expect(await storePage.waitUntilGone(first.needle, 120)).toBe(true);
      }
    });
  });
}
