// نستورد نوع Playwright الخاص بطلبات HTTP.
import { APIRequestContext } from '@playwright/test';

// مسارات الـ endpoints من ملف Toolifiy.JSON (التاجات "My Tools" و "Tool Configurations").
const PATHS = {
  tools: '/api/v1/merchant/tools',
  myTools: '/api/v1/merchant/tools/my',
};

// عميل API لإضافة وعرض وحذف أدوات التاجر.
export class MyToolsClient {
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

  // POST /merchant/tools/{tool}/configurations – نضيف الأداة بنموذج الـ builder بتاعها.
  async addTool(toolId: number | string, body: unknown) {
    return this.request.post(`${PATHS.tools}/${toolId}/configurations`, { data: body, headers: this.headers() });
  }

  // GET /merchant/tools/my – الأدوات اللي التاجر ضافها (متجمعة حسب الأداة).
  // الـ API بيرجّع أداتين بس في الصفحة افتراضيًا، فبنطلب 100 عشان ناخد القايمة كاملة في طلب واحد.
  async listMyTools(search?: string) {
    const params: Record<string, string> = { per_page: '100' };
    if (search) params['filter[search]'] = search;
    return this.request.get(PATHS.myTools, { params, headers: this.headers() });
  }

  // GET /merchant/tools/my/{merchantTool} – أداة متضافة واحدة.
  async getMyTool(id: number | string) {
    return this.request.get(`${PATHS.myTools}/${id}`, { headers: this.headers() });
  }

  // DELETE /merchant/tools/my/{merchantTool} – نشيل أداة متضافة.
  async deleteTool(id: number | string) {
    return this.request.delete(`${PATHS.myTools}/${id}`, { headers: this.headers() });
  }
}
