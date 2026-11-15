// نستورد test و expect من Playwright.
import { test, expect } from '../../shared/bug-capture';
// نستورد عميل Auth (عشان ناخد توكن) وعميل Profile.
import { AuthClient } from '../../auth/clients/AuthClient';
import { ProfileClient } from '../clients/ProfileClient';
// نستورد بيانات التست.
import { apiUrl, validMerchant, validPhones, invalidProfileChanges, invalidPasswordBodies } from '../../../test-data/test-data';

// تستات Profile API (تاج الـ OpenAPI: "Profile"، SRS 10.15).
test.describe('Profile – API', () => {
  // نتخطى كل التستات لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // عميل Profile، بيتعمل من جديد لكل تست (بتوكن جديد).
  let profile: ProfileClient;

  // قبل كل تست: نسجّل دخول ونعمل العميل.
  test.beforeEach(async ({ request }) => {
    // ناخد توكن لحساب التاجر.
    const token = await new AuthClient(request).getToken(validMerchant.email, validMerchant.password);
    // نعمل العميل بالتوكن ده.
    profile = new ProfileClient(request, token);
  });

  // GET للبروفايل بيرجّع بيانات التاجر.
  test('get profile returns merchant data', { tag: '@smoke' }, async () => {
    // ننده GET /profile.
    const response = await profile.getProfile();
    // المتوقع: 200.
    expect(response.status()).toBe(200);
    // نقرا الـ body.
    const body = await response.json();
    // المتوقع: مفتاح النجاح من مثال الـ OpenAPI.
    expect(body.key).toBe('profile_fetched');
    // المتوقع: نفس إيميل حساب التاجر.
    expect(body.data.email).toBe(validMerchant.email);
  });

  // رقم هاتف صحيح بيتحفظ، وبعدين الرقم الأصلي بيرجع.
  test('update phone with valid value', { tag: '@regression' }, async () => {
    // نقرا البروفايل الحالي (محتاجين حقوله عشان نبعتها، وعشان نرجّع الأصلي بعد كده).
    const original = (await (await profile.getProfile()).json()).data;
    // الـ body بكل الحقول المطلوبة من البروفايل الحالي.
    const base = { merchant_name: original.username, email: original.email, country_code: original.country_code, phone: original.phone };
    // try/finally: الرقم الأصلي بيتحط تاني حتى لو فحص فشل.
    try {
      // نستخدم رقم صحيح "عادي".
      const newPhone = validPhones[1];
      // نبعت التحديث.
      const response = await profile.updateProfile({ ...base, country_code: newPhone.countryCode, phone: newPhone.phone });
      // المتوقع: 200 ومفتاح النجاح.
      expect(response.status()).toBe(200);
      expect((await response.json()).key).toBe('profile_updated');
      // المتوقع: GET بيرجّع الرقم الجديد.
      const after = (await (await profile.getProfile()).json()).data;
      expect(after.phone).toBe(newPhone.phone);
    } finally {
      // نرجّع الرقم الأصلي.
      await profile.updateProfile(base);
    }
  });

  // أجسام البروفايل الغلط بترجّع 422 ومفيش حاجة بتتحفظ.
  test('invalid profile payloads return 422', { tag: '@regression' }, async () => {
    // نقرا البروفايل الحالي عشان نجيب الحقول المطلوبة.
    const original = (await (await profile.getProfile()).json()).data;
    const base = { merchant_name: original.username, email: original.email, country_code: original.country_code, phone: original.phone };
    // الـ body الفاضي لازم يترفض.
    expect((await profile.updateProfile({})).status()).toBe(422);
    // كل تغيير غلط (من بيانات التست) بيتضاف فوق بيانات البروفايل الحالية.
    for (const item of invalidProfileChanges) {
      // المتوقع: 422.
      expect((await profile.updateProfile({ ...base, ...item.change })).status(), item.name).toBe(422);
    }
    // فحص أمان: الرقم لسه زي ما هو.
    const after = (await (await profile.getProfile()).json()).data;
    expect(after.phone).toBe(original.phone);
  });

  // تغيير كلمة المرور بيرفض المدخلات الغلط (كلمة المرور الحالية الحقيقية عمرها ما بتتبعت).
  test('change password validation', { tag: '@regression' }, async () => {
    // نبعت كل جسم غلط (من بيانات التست) ونفحص الـ status.
    for (const data of invalidPasswordBodies) {
      // المتوقع: 422 (من الـ OpenAPI).
      expect((await profile.changePassword(data)).status(), JSON.stringify(data)).toBe(422);
    }
  });

  // كل endpoints البروفايل محتاجة توكن.
  test('profile endpoints without token return 401', { tag: '@critical' }, async ({ request }) => {
    // عميل بتوكن فاضي.
    const noToken = new ProfileClient(request, '');
    // المتوقع: 401 في الـ endpoints التلاتة.
    expect((await noToken.getProfile()).status()).toBe(401);
    expect((await noToken.updateProfile({})).status()).toBe(401);
    expect((await noToken.changePassword({})).status()).toBe(401);
  });
});
