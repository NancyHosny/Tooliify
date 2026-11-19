import { APIRequestContext } from '@playwright/test';

// مسارات الـ endpoints منسوخة من ملف Toolifiy.JSON (التاجات "Auth" و "Profile").
const PATHS = {
  login: '/api/v1/merchant/auth/login',
  logout: '/api/v1/merchant/auth/logout',
  refresh: '/api/v1/merchant/auth/refresh',
  firstLoginReset: '/api/v1/merchant/auth/first-login/reset',
  forgetPassword: '/api/v1/merchant/auth/forget-password',
  verifyOtp: '/api/v1/merchant/auth/forget-password/verify',
  resetPassword: '/api/v1/merchant/auth/forget-password/reset',
  profile: '/api/v1/merchant/profile',
};

// عميل API لموديول Auth: دالة بسيطة لكل endpoint.
// التستات بتنده الدوال دي وبتفحص النتايج بس (الـ status والـ body).
export class AuthClient {
  // كائن الطلبات اللي Playwright بيدّيه لكل تست (الـ baseURL هو API_URL من ملف .env).
  readonly request: APIRequestContext;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  // نبني هيدر Authorization لتوكن JWT.
  private bearer(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  // POST /auth/login – الـ body ممكن يكون أي حاجة (عشان التستات السلبية تبعت أجسام غلط).
  async login(body: unknown) {
    return this.request.post(PATHS.login, { data: body, headers: { 'Accept-Language': 'ar' } });
  }

  // نسجّل دخول ونرجّع التوكن بس (دالة مساعدة للتستات اللي محتاجة جلسة).
  async getToken(email: string, password: string): Promise<string> {
    const response = await this.login({ email, password });
    if (response.status() !== 200) {
      throw new Error(`Login failed with status ${response.status()}`);
    }
    return (await response.json()).data.jwt_access_token;
  }

  // POST /auth/logout بتوكن.
  async logout(token: string) {
    return this.request.post(PATHS.logout, { headers: this.bearer(token) });
  }

  // POST /auth/refresh بتوكن (الـ OpenAPI مش موضح إزاي التوكن القديم بيتبعت – محتاج توضيح).
  async refresh(token: string) {
    return this.request.post(PATHS.refresh, { headers: this.bearer(token) });
  }

  // GET /merchant/profile – بنستخدمه نتأكد إن التوكن لسه شغّال.
  async getProfile(token?: string) {
    return this.request.get(PATHS.profile, { headers: token ? this.bearer(token) : {} });
  }

  // POST /auth/forget-password – بيطلب إرسال رمز OTP على الإيميل.
  async forgetPassword(body: unknown) {
    return this.request.post(PATHS.forgetPassword, { data: body });
  }

  // POST /auth/forget-password/verify – بيتأكد من الـ OTP ويرجّع reset_token.
  async verifyOtp(body: unknown) {
    return this.request.post(PATHS.verifyOtp, { data: body });
  }

  // POST /auth/forget-password/reset – بيحط كلمة المرور الجديدة بـ reset_token.
  async resetPassword(body: unknown) {
    return this.request.post(PATHS.resetPassword, { data: body });
  }

  // POST /auth/first-login/reset – تغيير كلمة المرور الإجباري في أول دخول (محتاج توكن الجلسة المؤقتة).
  async firstLoginReset(body: unknown, token?: string) {
    // نبعت الطلب؛ التوكن اختياري عشان تست "من غير توكن ← 401" يقدر يستخدمه.
    return this.request.post(PATHS.firstLoginReset, { data: body, headers: token ? this.bearer(token) : {} });
  }
}
