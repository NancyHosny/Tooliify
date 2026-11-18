// نستورد test و expect من Playwright (الـ fixture اسمه "request" هو اللي بيبعت الطلبات).
import { test, expect } from '../../shared/bug-capture';
// نستورد بيانات التست.
import { store, storefrontApi } from '../../../test-data/test-data';

// الملف العام اللي المتجر بيحمّله (files.tooliify.com/newtoolify_<رقم التاجر>.js): فيه الأدوات المفعّلة وسكريبت الرسم.
// الملف عام ومحتاجش توكن (المتصفح بيحمّله كوسم script).
test.describe('Storefront – public store file', () => {
  // الملف بيتحمّل لما حد يفتح المتجر وكل الزوار بياخدوه.
  test('store file is public and is a JavaScript file', { tag: '@smoke' }, async ({ request }) => {
    // نطلب الملف من غير أي توكن.
    const response = await request.get(store.scriptUrl);
    // المتوقع: 200 ونوعه JavaScript.
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain(storefrontApi.scriptType);
  });

  // الملف مش فاضي وبيتغيّر لما الأدوات بتتغيّر.
  test('store file has content and a last-modified date', { tag: '@regression' }, async ({ request }) => {
    // نطلب الملف.
    const response = await request.get(store.scriptUrl);
    // المتوقع: فيه محتوى وتاريخ آخر تعديل.
    expect((await response.text()).length).toBeGreaterThan(storefrontApi.scriptMinLength);
    expect(response.headers()['last-modified']).toBeTruthy();
  });

  // ملف تاجر مش موجود.
  test('store file of an unknown merchant is not found', { tag: '@regression' }, async ({ request }) => {
    // نطلب ملف برقم تاجر مش موجود.
    const response = await request.get(storefrontApi.missingScript);
    // المتوقع: 404.
    expect(response.status()).toBe(404);
  });
});
