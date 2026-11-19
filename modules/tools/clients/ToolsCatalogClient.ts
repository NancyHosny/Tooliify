import { APIRequestContext } from '@playwright/test';

// مسارات الـ endpoints من ملف Toolifiy.JSON (التاجات "Tools" و "Categories").
const PATHS = {
  tools: '/api/v1/merchant/tools',
  categories: '/api/v1/merchant/tools/categories',
};

// عميل API لكتالوج الأدوات (endpoints للقراءة فقط).
export class ToolsCatalogClient {
  readonly request: APIRequestContext;
  readonly token: string;

  constructor(request: APIRequestContext, token: string) {
    this.request = request;
    this.token = token;
  }

  // هيدر Authorization وهيدر الرسايل العربي بيتبعتوا مع كل طلب.
  private headers() {
    return { Authorization: `Bearer ${this.token}`, 'Accept-Language': 'ar' };
  }

  // GET /merchant/tools – كل الأدوات في الكتالوج.
  async listTools() {
    return this.request.get(PATHS.tools, { headers: this.headers() });
  }

  // GET /merchant/tools/{tool} – أداة واحدة بالـ id.
  async getTool(id: number | string) {
    return this.request.get(`${PATHS.tools}/${id}`, { headers: this.headers() });
  }

  // GET /merchant/tools/categories – كل التصنيفات المفعّلة.
  async listCategories() {
    return this.request.get(PATHS.categories, { headers: this.headers() });
  }

  // GET /merchant/tools/categories/{category}/tools – أدوات تصنيف واحد.
  async listCategoryTools(id: number | string) {
    return this.request.get(`${PATHS.categories}/${id}/tools`, { headers: this.headers() });
  }
}
