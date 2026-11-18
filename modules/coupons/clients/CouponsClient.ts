// نستورد نوع Playwright الخاص بطلبات HTTP.
import { APIRequestContext } from '@playwright/test';

// مسارات الـ endpoints من ملف Toolifiy.JSON (تاج "Coupons").
const PATHS = {
  paginated: '/api/v1/merchant/coupons/paginated',
  selectable: '/api/v1/merchant/coupons',
  generateCode: '/api/v1/merchant/coupons/generate-code',
  one: (id: number | string) => `/api/v1/merchant/coupons/${id}`,
  status: (id: number | string) => `/api/v1/merchant/coupons/${id}/status`,
};

// عميل API للكوبونات: دالة بسيطة لكل endpoint.
export class CouponsClient {
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

  // GET /merchant/coupons/paginated – قايمة الكوبونات مع بحث وفلاتر.
  // الـ API بيرجّع 15 كوبون في الصفحة افتراضيًا، فبنطلب 100 عشان ناخد القايمة كاملة في طلب واحد.
  // "filters" فلاتر اختيارية بالشكل { 'filter[search]': 'اسم' }.
  async list(filters: Record<string, string> = {}) {
    return this.request.get(PATHS.paginated, { params: { per_page: '100', ...filters }, headers: this.headers() });
  }

  // GET /merchant/coupons – الكوبونات اللي ينفع تتختار في إعدادات الأدوات (من غير صفحات، من غير الكوبونات التلقائية).
  async listSelectable(search?: string) {
    return this.request.get(PATHS.selectable, { params: search ? { search } : {}, headers: this.headers() });
  }

  // GET /merchant/coupons/generate-code – رمز كوبون جديد بادئته TFY-.
  async generateCode() {
    return this.request.get(PATHS.generateCode, { headers: this.headers() });
  }

  // POST /merchant/coupons – نعمل كوبون على المنصة (سلة) وبعدين نحفظه عندنا.
  async create(body: unknown) {
    return this.request.post(PATHS.selectable, { data: body, headers: this.headers() });
  }

  // GET /merchant/coupons/{coupon} – كوبون واحد.
  async get(id: number | string) {
    return this.request.get(PATHS.one(id), { headers: this.headers() });
  }

  // PUT /merchant/coupons/{coupon} – نعدّل الكوبون (كل الحقول اختيارية).
  async update(id: number | string, body: unknown) {
    return this.request.put(PATHS.one(id), { data: body, headers: this.headers() });
  }

  // DELETE /merchant/coupons/{coupon} – نحذف الكوبون من المنصة ونخفيه عندنا.
  async remove(id: number | string) {
    return this.request.delete(PATHS.one(id), { headers: this.headers() });
  }

  // PATCH /merchant/coupons/{coupon}/status – نفعّل أو نوقّف الكوبون.
  async setStatus(id: number | string, body: unknown) {
    return this.request.patch(PATHS.status(id), { data: body, headers: this.headers() });
  }
}
