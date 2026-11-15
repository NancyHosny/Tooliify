// نستورد test و expect من Playwright (الـ fixture اسمه "request" هو اللي بيبعت طلبات الـ API).
import { test, expect } from '../../shared/bug-capture';
// نستورد عميل Auth API (دالة لكل endpoint).
import { AuthClient } from '../clients/AuthClient';
// نستورد بيانات التست.
import {
  apiUrl,
  validMerchant,
  unregisteredEmail,
  wrongPassword,
  invalidEmails,
  invalidLoginBodies,
  invalidOtpBodies,
  fakeJwt,
  fakeResetBody,
  firstLoginResetBody,
} from '../../../test-data/test-data';

// كل تستات Auth API (تاج الـ OpenAPI: "Auth").
test.describe('Authentication – API', () => {
  // نتخطى كل التستات لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // عميل الـ API، بيتعمل من جديد لكل تست.
  let auth: AuthClient;

  // قبل كل تست: نعمل العميل.
  test.beforeEach(async ({ request }) => {
    // نعمل العميل.
    auth = new AuthClient(request);
  });

  // ---------- تسجيل الدخول ----------

  // دخول صحيح بيرجّع 200 وتوكن وبيانات التاجر.
  test('valid login returns 200 and access token', { tag: '@smoke' }, async () => {
    // نسجّل دخول بالحساب الصحيح.
    const response = await auth.login({ email: validMerchant.email, password: validMerchant.password });
    // المتوقع: status 200.
    expect(response.status()).toBe(200);
    // نقرا الـ body.
    const body = await response.json();
    // المتوقع: مفتاح النجاح من مثال الـ OpenAPI.
    expect(body.key).toBe('login_success');
    // المتوقع: نفس الإيميل راجع.
    expect(body.data.email).toBe(validMerchant.email);
    // المتوقع: توكن راجع.
    expect(body.data.jwt_access_token).toEqual(expect.any(String));
  });

  // إيميل مش مسجّل بيرجّع 422.
  test('unregistered email returns 422', { tag: '@regression' }, async () => {
    // نجرّب إيميل مش موجود.
    const response = await auth.login({ email: unregisteredEmail, password: wrongPassword });
    // المتوقع: 422.
    expect(response.status()).toBe(422);
  });

  // أجسام الدخول الغلط بترجّع 422.
  test('invalid payloads return 422', { tag: '@regression' }, async () => {
    // نبعت كل جسم غلط (من بيانات التست) ونفحص الـ status.
    for (const data of invalidLoginBodies) {
      // نبعت طلب الدخول الغلط.
      const response = await auth.login(data);
      // المتوقع: 422.
      expect(response.status(), JSON.stringify(data)).toBe(422);
    }
  });

  // ---------- التوكن والجلسة ----------

  // endpoint محمي من غير توكن بيرجّع 401.
  test('profile without token returns 401', { tag: '@regression' }, async () => {
    // ننده endpoint البروفايل من غير توكن.
    const response = await auth.getProfile();
    // المتوقع: 401.
    expect(response.status()).toBe(401);
  });

  // بعد الخروج نفس التوكن بيترفض.
  test('token is invalid after logout', { tag: '@regression' }, async () => {
    // نسجّل دخول ونجيب توكن.
    const token = await auth.getToken(validMerchant.email, validMerchant.password);
    // قبل الخروج التوكن شغّال.
    expect((await auth.getProfile(token)).status()).toBe(200);
    // نخرج بالتوكن ده.
    expect((await auth.logout(token)).status()).toBe(200);
    // بعد الخروج نفس التوكن بيرجّع 401.
    expect((await auth.getProfile(token)).status()).toBe(401);
  });

  // توكن مزيّف بيترفض.
  test('fake token returns 401', { tag: '@regression' }, async () => {
    // ننده endpoint البروفايل بتوكن مزيّف.
    const response = await auth.getProfile(fakeJwt);
    // المتوقع: 401.
    expect(response.status()).toBe(401);
  });

  // التجديد (refresh) بيرجّع توكن جديد شغّال.
  test('refresh returns a new access token', { tag: '@regression' }, async () => {
    // نسجّل دخول عشان ناخد أول توكن.
    const token = await auth.getToken(validMerchant.email, validMerchant.password);
    // نطلب توكن جديد (الـ OpenAPI مش موضح إزاي التوكن القديم بيتبعت – محتاج توضيح).
    const response = await auth.refresh(token);
    // المتوقع: 200.
    expect(response.status()).toBe(200);
    // نقرا الـ body.
    const body = await response.json();
    // المتوقع: مفتاح النجاح من مثال الـ OpenAPI.
    expect(body.key).toBe('refresh_success');
    // المتوقع: التوكن الجديد بيفتح البروفايل.
    expect((await auth.getProfile(body.data.jwt_access_token)).status()).toBe(200);
  });

  // ---------- نسيت كلمة المرور وإعادة التعيين (من غير إيميل حقيقي) ----------

  // فحص مدخلات forget-password.
  test('forget-password validation', { tag: '@regression' }, async () => {
    // الإيميل ناقص: 422.
    expect((await auth.forgetPassword({})).status()).toBe(422);
    // شكل إيميل غلط: 422.
    expect((await auth.forgetPassword({ email: invalidEmails[1] })).status()).toBe(422);
    // إيميل مش مسجّل: الـ SRS بيقول رد عام، فبنتوقع 200 (محتاج توضيح لو الـ API بيرجّع 422).
    expect((await auth.forgetPassword({ email: unregisteredEmail })).status()).toBe(200);
  });

  // فحص مدخلات التحقق من الـ OTP.
  test('verify OTP validation', { tag: '@regression' }, async () => {
    // نبعت كل جسم غلط (من بيانات التست) ونفحص الـ status.
    for (const data of invalidOtpBodies) {
      // نبعت طلب التحقق الغلط.
      const response = await auth.verifyOtp(data);
      // المتوقع: 422.
      expect(response.status(), JSON.stringify(data)).toBe(422);
    }
  });

  // إعادة التعيين بتوكن مزيّف بتترفض ومفيش حاجة بتتغيّر.
  test('reset password with invalid token returns 422', { tag: '@regression' }, async () => {
    // نبعت إعادة تعيين بتوكن مزيّف للإيميل الحقيقي.
    const response = await auth.resetPassword({ email: validMerchant.email, ...fakeResetBody });
    // المتوقع: 422.
    expect(response.status()).toBe(422);
    // فحص أمان: كلمة المرور الحقيقية لسه شغّالة.
    expect((await auth.login({ email: validMerchant.email, password: validMerchant.password })).status()).toBe(200);
  });

  // إعادة تعيين أول دخول من غير توكن بترجّع 401.
  test('first-login reset without token returns 401', { tag: '@regression' }, async () => {
    // نبعت إعادة التعيين من غير توكن.
    const response = await auth.firstLoginReset(firstLoginResetBody);
    // المتوقع: 401 (من الـ OpenAPI).
    expect(response.status()).toBe(401);
  });
});
