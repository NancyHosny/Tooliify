// نستورد test و expect من Playwright.
import { test, expect } from '../../shared/bug-capture';
// نستورد عميل Auth (عشان ناخد توكن) وعميل الكتالوج.
import { AuthClient } from '../../auth/clients/AuthClient';
import { ToolsCatalogClient } from '../clients/ToolsCatalogClient';
// نستورد بيانات التست.
import { apiUrl, validMerchant, unknownId, notNumericId } from '../../../test-data/test-data';

// شكل أداة واحدة وتصنيف واحد (من الـ schemas في الـ OpenAPI).
type Tool = { id: number; name: string; slug: string; category_id: number; is_added: boolean };
type Category = { id: number; name: string };

// تستات API لكتالوج الأدوات (تاجات الـ OpenAPI: "Tools" و "Categories"، SRS 10.8). كل الـ endpoints للقراءة فقط.
test.describe('Tools catalog – API', () => {
  // نتخطى كل التستات لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // عميل الكتالوج، بيتعمل من جديد لكل تست (بتوكن جديد).
  let catalog: ToolsCatalogClient;

  // قبل كل تست: نسجّل دخول ونعمل العميل.
  test.beforeEach(async ({ request }) => {
    // ناخد توكن لحساب التاجر.
    const token = await new AuthClient(request).getToken(validMerchant.email, validMerchant.password);
    // نعمل العميل بالتوكن ده.
    catalog = new ToolsCatalogClient(request, token);
  });

  // GET /tools بيرجّع الكتالوج كامل.
  test('list tools returns the catalog', { tag: '@smoke' }, async () => {
    // ننده GET /tools.
    const response = await catalog.listTools();
    // المتوقع: 200 ومفتاح النجاح من الـ OpenAPI.
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toBe('tools_success');
    // المتوقع: قايمة مش فاضية وكل أداة فيها الحقول الأساسية.
    const tools = body.data as Tool[];
    expect(tools.length).toBeGreaterThan(0);
    for (const tool of tools) {
      expect(typeof tool.id, tool.name).toBe('number');
      expect(tool.name.length, String(tool.id)).toBeGreaterThan(0);
      expect(tool.slug.length, tool.name).toBeGreaterThan(0);
      expect(typeof tool.category_id, tool.name).toBe('number');
      expect(typeof tool.is_added, tool.name).toBe('boolean');
    }
    // المتوقع: مفيش id أو slug مكرر.
    expect(new Set(tools.map((t) => t.id)).size).toBe(tools.length);
    expect(new Set(tools.map((t) => t.slug)).size).toBe(tools.length);
  });

  // GET /tools/{id} بيرجّع نفس الأداة اللي في القايمة.
  test('get one tool by id', { tag: '@regression' }, async () => {
    // ناخد أول أداة من القايمة.
    const first = ((await (await catalog.listTools()).json()).data as Tool[])[0];
    // ننده GET /tools/{id}.
    const response = await catalog.getTool(first.id);
    // المتوقع: 200 ومفتاح النجاح ونفس الأداة.
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toBe('tool_success');
    expect(body.data.id).toBe(first.id);
    expect(body.data.name).toBe(first.name);
    expect(body.data.slug).toBe(first.slug);
  });

  // GET /tools/{id} بـ id مش موجود بيرجّع 404.
  test('get tool with unknown id returns 404', { tag: '@regression' }, async () => {
    // المتوقع: 404 لـ id مش موجود.
    expect((await catalog.getTool(unknownId)).status()).toBe(404);
    // المتوقع: 404 لـ id مش رقم.
    expect((await catalog.getTool(notNumericId)).status()).toBe(404);
  });

  // GET /categories بيرجّع التصنيفات المفعّلة.
  test('list categories', { tag: '@smoke' }, async () => {
    // ننده GET /categories.
    const response = await catalog.listCategories();
    // المتوقع: 200 ومفتاح النجاح.
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toBe('categories_success');
    // المتوقع: قايمة مش فاضية وكل تصنيف ليه id واسم.
    const categories = body.data as Category[];
    expect(categories.length).toBeGreaterThan(0);
    for (const category of categories) {
      expect(typeof category.id).toBe('number');
      expect(category.name.length, String(category.id)).toBeGreaterThan(0);
    }
  });

  // GET /categories/{id}/tools بيرجّع أدوات التصنيف ده بس.
  test('list tools of one category', { tag: '@regression' }, async () => {
    // ناخد أول تصنيف.
    const first = ((await (await catalog.listCategories()).json()).data as Category[])[0];
    // ننده GET /categories/{id}/tools.
    const response = await catalog.listCategoryTools(first.id);
    // المتوقع: 200 ومفتاح النجاح.
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toBe('category_tools_success');
    // المتوقع: كل أداة راجعة تابعة للتصنيف ده.
    for (const tool of body.data as Tool[]) {
      expect(tool.category_id, tool.name).toBe(first.id);
    }
  });

  // GET /categories/{id}/tools بـ id مش موجود بيرجّع 404.
  test('list tools of unknown category returns 404', { tag: '@regression' }, async () => {
    // المتوقع: 404 لـ id مش موجود.
    expect((await catalog.listCategoryTools(unknownId)).status()).toBe(404);
    // المتوقع: 404 لـ id مش رقم.
    expect((await catalog.listCategoryTools(notNumericId)).status()).toBe(404);
  });

  // كل أداة تابعة لتصنيف موجود، ومجموع قوايم التصنيفات بيساوي الكتالوج كله.
  test('tools and categories are consistent', { tag: '@regression' }, async () => {
    // نقرا القايمتين.
    const tools = (await (await catalog.listTools()).json()).data as Tool[];
    const categories = (await (await catalog.listCategories()).json()).data as Category[];
    const categoryIds = categories.map((c) => c.id);
    // المتوقع: كل أداة بتشاور على تصنيف معروف.
    for (const tool of tools) {
      expect(categoryIds, tool.name).toContain(tool.category_id);
    }
    // المتوقع: مجموع قوايم التصنيفات بيساوي الكتالوج كله.
    let sum = 0;
    for (const category of categories) {
      sum += ((await (await catalog.listCategoryTools(category.id)).json()).data as Tool[]).length;
    }
    expect(sum).toBe(tools.length);
  });

  // الـ endpoints الأربعة كلها محتاجة توكن.
  test('catalog endpoints without token return 401', { tag: '@critical' }, async ({ request }) => {
    // عميل بتوكن فاضي.
    const noToken = new ToolsCatalogClient(request, '');
    // المتوقع: 401 في كل endpoint.
    expect((await noToken.listTools()).status()).toBe(401);
    expect((await noToken.getTool(1)).status()).toBe(401);
    expect((await noToken.listCategories()).status()).toBe(401);
    expect((await noToken.listCategoryTools(1)).status()).toBe(401);
  });
});
