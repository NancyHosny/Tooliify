import { test, expect } from '../../shared/bug-capture';
import { AuthClient } from '../clients/AuthClient';
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
    auth = new AuthClient(request);
  });

  // ---------- تسجيل الدخول ----------

  // دخول صحيح بيرجّع 200 وتوكن وبيانات التاجر.
  test('valid login returns 200 and access token', { tag: '@smoke' }, async () => {
    const response = await auth.login({ email: validMerchant.email, password: validMerchant.password });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toBe('login_success');
    expect(body.data.email).toBe(validMerchant.email);
    expect(body.data.jwt_access_token).toEqual(expect.any(String));
  });

  // إيميل مش مسجّل بيرجّع 422.
  test('unregistered email returns 422', { tag: '@regression' }, async () => {
    const response = await auth.login({ email: unregisteredEmail, password: wrongPassword });
    expect(response.status()).toBe(422);
  });

  // أجسام الدخول الغلط بترجّع 422.
  test('invalid payloads return 422', { tag: '@regression' }, async () => {
    // نبعت كل جسم غلط (من بيانات التست) ونفحص الـ status.
    for (const data of invalidLoginBodies) {
      const response = await auth.login(data);
      expect(response.status(), JSON.stringify(data)).toBe(422);
    }
  });

  // ---------- التوكن والجلسة ----------

  // endpoint محمي من غير توكن بيرجّع 401.
  test('profile without token returns 401', { tag: '@regression' }, async () => {
    const response = await auth.getProfile();
    expect(response.status()).toBe(401);
  });

  // بعد الخروج نفس التوكن بيترفض.
  test('token is invalid after logout', { tag: '@regression' }, async () => {
    const token = await auth.getToken(validMerchant.email, validMerchant.password);
    expect((await auth.getProfile(token)).status()).toBe(200);
    expect((await auth.logout(token)).status()).toBe(200);
    expect((await auth.getProfile(token)).status()).toBe(401);
  });

  // توكن مزيّف بيترفض.
  test('fake token returns 401', { tag: '@regression' }, async () => {
    const response = await auth.getProfile(fakeJwt);
    expect(response.status()).toBe(401);
  });

  // التجديد (refresh) بيرجّع توكن جديد شغّال.
  test('refresh returns a new access token', { tag: '@regression' }, async () => {
    // نسجّل دخول عشان ناخد أول توكن.
    const token = await auth.getToken(validMerchant.email, validMerchant.password);
    const response = await auth.refresh(token);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toBe('refresh_success');
    expect((await auth.getProfile(body.data.jwt_access_token)).status()).toBe(200);
  });

  // ---------- نسيت كلمة المرور وإعادة التعيين (من غير إيميل حقيقي) ----------

  // فحص مدخلات forget-password.
  test('forget-password validation', { tag: '@regression' }, async () => {
    expect((await auth.forgetPassword({})).status()).toBe(422);
    expect((await auth.forgetPassword({ email: invalidEmails[1] })).status()).toBe(422);
    // إيميل مش مسجّل: الـ SRS بيقول رد عام، فبنتوقع 200 (محتاج توضيح لو الـ API بيرجّع 422).
    expect((await auth.forgetPassword({ email: unregisteredEmail })).status()).toBe(200);
  });

  // فحص مدخلات التحقق من الـ OTP.
  test('verify OTP validation', { tag: '@regression' }, async () => {
    // نبعت كل جسم غلط (من بيانات التست) ونفحص الـ status.
    for (const data of invalidOtpBodies) {
      const response = await auth.verifyOtp(data);
      expect(response.status(), JSON.stringify(data)).toBe(422);
    }
  });

  // إعادة التعيين بتوكن مزيّف بتترفض ومفيش حاجة بتتغيّر.
  test('reset password with invalid token returns 422', { tag: '@regression' }, async () => {
    const response = await auth.resetPassword({ email: validMerchant.email, ...fakeResetBody });
    expect(response.status()).toBe(422);
    // فحص أمان: كلمة المرور الحقيقية لسه شغّالة.
    expect((await auth.login({ email: validMerchant.email, password: validMerchant.password })).status()).toBe(200);
  });

  // إعادة تعيين أول دخول من غير توكن بترجّع 401.
  test('first-login reset without token returns 401', { tag: '@regression' }, async () => {
    const response = await auth.firstLoginReset(firstLoginResetBody);
    expect(response.status()).toBe(401);
  });
});
