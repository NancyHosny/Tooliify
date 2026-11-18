// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد صفحة المتجر (موجودة في موديول الأدوات).
import { StorePage } from '../../tools/pages/StorePage';
// نستورد بيانات التست.
import { store } from '../../../test-data/test-data';

// صفحة المتجر الحقيقية (متجر تجريبي على سلة) وهي بتحمّل سكريبت Tooliify.
// الصفحة عامة، ومحتاجة مفيش أداة معينة: بنفحص السكريبت نفسه.
test.describe('Storefront – store page', () => {
  // الصفحة بتتحمّل من الإنترنت العام وسلة بطيئة أحيانًا.
  test.describe.configure({ timeout: 90_000 });

  // السكريبت بيتحمّل من الملف العام بنجاح.
  test('store page loads the Tooliify script', { tag: '@smoke' }, async ({ page }) => {
    // نستنى رد ملف السكريبت ونفتح المتجر.
    const script = page.waitForResponse((response) => response.url().startsWith(store.scriptUrl), { timeout: 60_000 });
    await new StorePage(page).open();
    // المتوقع: الملف رجع 200 وهو JavaScript.
    const response = await script;
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('javascript');
  });

  // السكريبت لازم يتحمّل مرة واحدة بس في الصفحة.
  test('store page includes the Tooliify script only once', { tag: '@regression' }, async ({ page }) => {
    // نفتح المتجر ونستنى لحد ما الصفحة تخلص تحميل.
    await new StorePage(page).open();
    await page.waitForLoadState('load');
    // المتوقع: وسم script واحد بس للملف (لو اتحمّل أكتر من مرة السكريبت بيتنفذ أكتر من مرة وبيحصل أخطاء).
    await expect(page.locator(`script[src^="${store.scriptUrl}"]`)).toHaveCount(1);
  });

  // السكريبت لازم يشتغل من غير أخطاء JavaScript.
  test('store page runs the Tooliify script without errors', { tag: '@regression' }, async ({ page }) => {
    // نسجّل أي خطأ JavaScript بيحصل في الصفحة (أخطاء الطلبات الخارجية مش من النوع ده).
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    // نفتح المتجر ونستنى السكريبت يرسم أدواته.
    await new StorePage(page).open();
    await page.waitForLoadState('load');
    await page.waitForTimeout(8_000);
    // المتوقع: مفيش أي خطأ.
    expect(errors, `${errors.length} script errors`).toEqual([]);
  });
});
