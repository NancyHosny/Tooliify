import { test, expect } from '../../shared/bug-capture';
import { StorePage } from '../../tools/pages/StorePage';
import { store } from '../../../test-data/test-data';

// صفحة المتجر الحقيقية (متجر تجريبي على سلة) وهي بتحمّل سكريبت Tooliify.
// الصفحة عامة، ومحتاجة مفيش أداة معينة: بنفحص السكريبت نفسه.
test.describe('Storefront – store page', () => {
  // الصفحة بتتحمّل من الإنترنت العام وسلة بطيئة أحيانًا.
  test.describe.configure({ timeout: 90_000 });

  // السكريبت بيتحمّل من الملف العام بنجاح.
  test('store page loads the Tooliify script', { tag: '@smoke' }, async ({ page }) => {
    const script = page.waitForResponse((response) => response.url().startsWith(store.scriptUrl), { timeout: 60_000 });
    await new StorePage(page).open();
    const response = await script;
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('javascript');
  });

  // السكريبت لازم يتحمّل مرة واحدة بس في الصفحة.
  test('store page includes the Tooliify script only once', { tag: '@regression' }, async ({ page }) => {
    await new StorePage(page).open();
    await page.waitForLoadState('load');
    await expect(page.locator(`script[src^="${store.scriptUrl}"]`)).toHaveCount(1);
  });

  // السكريبت لازم يشتغل من غير أخطاء JavaScript.
  test('store page runs the Tooliify script without errors', { tag: '@regression' }, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await new StorePage(page).open();
    await page.waitForLoadState('load');
    await page.waitForTimeout(8_000);
    expect(errors, `${errors.length} script errors`).toEqual([]);
  });
});
