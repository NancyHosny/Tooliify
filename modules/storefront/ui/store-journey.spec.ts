// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد صفحات Tooliify (الـ builder و"أدواتي") وصفحة المتجر.
import { ToolBuilderPage } from '../../tools/pages/ToolBuilderPage';
import { MyToolsPage } from '../../tools/pages/MyToolsPage';
import { StorePage } from '../../tools/pages/StorePage';
// نستورد بيانات التست.
import { tools, storeMarker, newQaToolName, messages, storeWait } from '../../../test-data/test-data';

// هنا الاسكريبت بيفتح Tooliify بنفسه (من الواجهة، من غير API) ويعمل اللي التاجر بيعمله، وبعدين يروح المتجر الحقيقي ويشوف النتيجة.
// شغّليه مع --headed (أو npm run test:storefront:headed) عشان تتفرجي: بيضيف أداة الكوكيز باسم QA وبيدوّر عليها في المتجر.
// الأداة الحقيقية مبتتلمسش: الأداة اللي بنعملها اسمها بيبدأ بـ "QA-" وبتتحذف بعد كل تست.
test.describe('Storefront – what the merchant does in Tooliify shows in the store', () => {
  // الحفظ والنشر وتحميل المتجر الحقيقي بطيئين، فالتستات دي بتاخد دقايق.
  test.describe.configure({ timeout: 300_000 });

  // أداة الكوكيز: الحقل اللي بنكتب فيه قيمة مميزة هو عنوانها (config.title).
  const tool = tools['cookies-consent'];
  // الـ Page Objects، بتتعمل من جديد لكل تست.
  let builder: ToolBuilderPage;
  let myTools: MyToolsPage;
  let store: StorePage;
  // اسم الأداة والقيمة المميزة اللي بندوّر عليها في المتجر.
  let name = '';
  let marker = { value: '', needle: '' };

  // قبل كل تست: نفتح الـ builder ونضيف الأداة من الواجهة (كتالوج ← أداة الكوكيز ← حفظ)، بعنوان مميز.
  test.beforeEach(async ({ page }) => {
    builder = new ToolBuilderPage(page);
    myTools = new MyToolsPage(page);
    store = new StorePage(page);
    name = newQaToolName(tool.slug);
    marker = storeMarker(tool, 'qas');
    await builder.addAndWait(tool, name, marker.value);
  });

  // بعد كل تست: نحذف أداة QA من "أدواتي".
  test.afterEach(async () => {
    await myTools.deleteQaTools();
  });

  // أداة اتضافت من Tooliify لازم تظهر في المتجر.
  test('a tool added in Tooliify appears in the store', { tag: '@smoke' }, async () => {
    // نفتح المتجر الحقيقي (من غير تسجيل دخول).
    await store.open();
    // المتوقع: عنوان الأداة المميز ظهر في صفحة المتجر (بنعمل reload لحد ما يظهر، لأن المتجر بيتحدّث بعد ثواني).
    expect(await store.waitUntilContains(marker.needle, storeWait.fileSeconds)).toBe(true);
  });

  // أداة اتوقّفت من "أدواتي" لازم تختفي من المتجر.
  test('a tool stopped in my tools disappears from the store', { tag: '@regression' }, async () => {
    // الأول نتأكد إن الأداة ظاهرة في المتجر.
    await store.open();
    expect(await store.waitUntilContains(marker.needle, storeWait.fileSeconds)).toBe(true);
    // نروح "أدواتي" ونوقّف الأداة بمفتاح التشغيل ونأكد.
    await myTools.open();
    await myTools.statusSwitch(name).click();
    await myTools.confirmStatusButton.click();
    // المتوقع: "أدواتي" بتعرض الأداة "غير مفعلة".
    await expect(myTools.statusBadge(name)).toHaveText(messages.toolInactive, { timeout: 30_000 });
    // نرجع للمتجر. المتوقع: العنوان اختفى.
    await store.open();
    expect(await store.waitUntilGone(marker.needle, storeWait.fileSeconds)).toBe(true);
  });

  // أداة اتحذفت من "أدواتي" لازم تختفي من المتجر.
  test('a tool deleted in my tools disappears from the store', { tag: '@regression' }, async () => {
    // الأول نتأكد إن الأداة ظاهرة في المتجر.
    await store.open();
    expect(await store.waitUntilContains(marker.needle, storeWait.fileSeconds)).toBe(true);
    // نروح "أدواتي" ونحذف الأداة ونأكد.
    await myTools.open();
    await myTools.deleteButton(name).click();
    await myTools.confirmDeleteButton.click();
    await expect(myTools.deleteDialog).toBeHidden({ timeout: 30_000 });
    // المتوقع: "أدواتي" مبقتش بتعرضها.
    await myTools.open();
    await expect(myTools.row(name)).toHaveCount(0);
    // نرجع للمتجر. المتوقع: العنوان اختفى.
    await store.open();
    expect(await store.waitUntilGone(marker.needle, storeWait.fileSeconds)).toBe(true);
  });
});
