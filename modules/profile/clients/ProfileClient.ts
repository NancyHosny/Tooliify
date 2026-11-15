// نستورد نوع Playwright الخاص بطلبات HTTP.
import { APIRequestContext } from '@playwright/test';

// مسارات الـ endpoints من ملف Toolifiy.JSON (تاج "Profile").
const PATHS = {
  profile: '/api/v1/merchant/profile',
  password: '/api/v1/merchant/profile/password',
};

// عميل API لموديول Profile.
export class ProfileClient {
  // كائن الطلبات (الـ baseURL هو API_URL).
  readonly request: APIRequestContext;
  // الـ JWT بتاع التاجر اللي عامل تسجيل دخول.
  readonly token: string;

  // نحفظ كائن الطلبات والتوكن.
  constructor(request: APIRequestContext, token: string) {
    this.request = request;
    this.token = token;
  }

  // هيدر Authorization وهيدر الرسايل العربي بيتبعتوا مع كل طلب.
  private headers() {
    return { Authorization: `Bearer ${this.token}`, 'Accept-Language': 'ar' };
  }

  // GET /merchant/profile.
  async getProfile() {
    return this.request.get(PATHS.profile, { headers: this.headers() });
  }

  // PUT /merchant/profile – الـ OpenAPI بيطلب merchant_name و email و country_code و phone.
  async updateProfile(body: unknown) {
    return this.request.put(PATHS.profile, { data: body, headers: this.headers() });
  }

  // PUT /merchant/profile/password – الحقول: current_password و password و password_confirmation.
  async changePassword(body: unknown) {
    return this.request.put(PATHS.password, { data: body, headers: this.headers() });
  }
}
