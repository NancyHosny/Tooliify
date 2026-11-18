// نستورد نوع Playwright الخاص بطلبات HTTP.
import { APIRequestContext } from '@playwright/test';

// مسارات الـ endpoints اللي المتجر (مش لوحة التحكم) بينده عليها. من ملف Toolifiy.JSON.
// كلها عامة: مفيش توكن، لأن اللي بيبعتها هو سكريبت Tooliify جوه المتجر.
const PATHS = {
  trackOne: (id: number | string) => `/api/v1/tracking/tools/${id}`,
  review: '/api/v1/customer-reviews',
  automaticCoupon: '/api/v1/automatic-coupons',
};

// سكريبت Tooliify بيبعت الطلبات بهيدر Accept: application/json (زي أي طلب JavaScript)، فبنبعته إحنا كمان.
// من غيره بعض أخطاء السيرفر بترجع صفحة HTML برقم 200 بدل JSON برقم 422 (شوفي README).
const HEADERS = { Accept: 'application/json' };

// عميل API للمتجر: دالة بسيطة لكل endpoint.
export class StorefrontClient {
  // كائن الطلبات (الـ baseURL هو API_URL).
  readonly request: APIRequestContext;

  // نحفظ كائن الطلبات.
  constructor(request: APIRequestContext) {
    this.request = request;
  }

  // POST /tracking/tools/{merchantTool} – حدث واحد (view / hover / click / submission / conversion).
  // "body" ممكن يكون أي حاجة عشان التستات السلبية تبعت أجسام غلط.
  async trackOne(id: number | string, body: unknown) {
    return this.request.post(PATHS.trackOne(id), { data: body, headers: HEADERS });
  }

  // POST /customer-reviews – تقييم من زائر المتجر (multipart/form-data، والصورة اختيارية).
  async submitReview(fields: Record<string, string | { name: string; mimeType: string; buffer: Buffer }>) {
    return this.request.post(PATHS.review, { multipart: fields, headers: HEADERS });
  }

  // POST /automatic-coupons – إصدار كوبون تلقائي لزائر (من أدوات الكوبونات).
  async issueAutomaticCoupon(body: unknown) {
    return this.request.post(PATHS.automaticCoupon, { data: body, headers: HEADERS });
  }
}
