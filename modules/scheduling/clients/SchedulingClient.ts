// نستورد نوع Playwright الخاص بطلبات HTTP.
import { APIRequestContext } from '@playwright/test';

// مسارات الـ endpoints من ملف Toolifiy.JSON (تاج "Tool Scheduling").
const PATHS = {
  schedules: '/api/v1/merchant/tools/my/schedules',
  group: '/api/v1/merchant/tools/my/schedule-group',
  one: (id: number | string) => `/api/v1/merchant/tools/my/${id}/schedule`,
};

// عميل API للجدولة: دالة بسيطة لكل endpoint.
export class SchedulingClient {
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

  // GET /merchant/tools/my/schedules – صف لكل أداة متضافة (مع حالة الجدولة).
  // الـ API بيرجّع 6 صفوف في الصفحة افتراضيًا، فبنطلب 100 عشان ناخد القايمة كاملة في طلب واحد.
  // "filters" فلاتر اختيارية بالشكل { 'filter[search]': 'اسم' }.
  async listSchedules(filters: Record<string, string> = {}) {
    return this.request.get(PATHS.schedules, { params: { per_page: '100', ...filters }, headers: this.headers() });
  }

  // PUT /merchant/tools/my/{merchantTool}/schedule – نفعّل أو نلغي الجدولة لأداة واحدة.
  async setSchedule(id: number | string, body: unknown) {
    return this.request.put(PATHS.one(id), { data: body, headers: this.headers() });
  }

  // PUT /merchant/tools/my/schedule-group – نجدول مجموعة أدوات بنفس الفترة.
  async setGroupSchedule(body: unknown) {
    return this.request.put(PATHS.group, { data: body, headers: this.headers() });
  }
}
