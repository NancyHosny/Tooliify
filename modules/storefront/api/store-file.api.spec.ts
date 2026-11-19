import { test, expect } from '../../shared/bug-capture';
import { store, storefrontApi } from '../../../test-data/test-data';

// الملف العام اللي المتجر بيحمّله (files.tooliify.com/newtoolify_<رقم التاجر>.js): فيه الأدوات المفعّلة وسكريبت الرسم.
// الملف عام ومحتاجش توكن (المتصفح بيحمّله كوسم script).
test.describe('Storefront – public store file', () => {
  // الملف بيتحمّل لما حد يفتح المتجر وكل الزوار بياخدوه.
  test('store file is public and is a JavaScript file', { tag: '@smoke' }, async ({ request }) => {
    const response = await request.get(store.scriptUrl);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain(storefrontApi.scriptType);
  });

  // الملف مش فاضي وبيتغيّر لما الأدوات بتتغيّر.
  test('store file has content and a last-modified date', { tag: '@regression' }, async ({ request }) => {
    const response = await request.get(store.scriptUrl);
    expect((await response.text()).length).toBeGreaterThan(storefrontApi.scriptMinLength);
    expect(response.headers()['last-modified']).toBeTruthy();
  });

  // ملف تاجر مش موجود.
  test('store file of an unknown merchant is not found', { tag: '@regression' }, async ({ request }) => {
    const response = await request.get(storefrontApi.missingScript);
    expect(response.status()).toBe(404);
  });
});
