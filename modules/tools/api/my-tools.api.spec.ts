// نستورد test و expect من Playwright.
import { test, expect } from '../../shared/bug-capture';
// نستورد عميل Auth (عشان ناخد توكن) وعميل My Tools.
import { AuthClient } from '../../auth/clients/AuthClient';
import { MyToolsClient } from '../clients/MyToolsClient';
// نستورد بيانات التست.
import {
  apiUrl, validMerchant, toolToAdd, newQaToolName, addToolBody, invalidAddToolBodies, unknownId, qaPrefix,
} from '../../../test-data/test-data';

// مجموعة واحدة من قايمة "أدواتي" (من الـ schema اسمه MerchantToolInstancesResource في الـ OpenAPI).
type Group = { tool: { id: number; slug: string }; instances: { id: number; display_name: string; status: string }[] };

// تستات API لـ "أدواتي" (تاجات الـ OpenAPI: "My Tools" و "Tool Configurations"، SRS 10.9 / 10.10).
test.describe('My tools – API', () => {
  // نتخطى كل التستات لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // العميل، بيتعمل من جديد لكل تست (بتوكن جديد).
  let myTools: MyToolsClient;

  // قبل كل تست: نسجّل دخول ونعمل العميل.
  test.beforeEach(async ({ request }) => {
    const token = await new AuthClient(request).getToken(validMerchant.email, validMerchant.password);
    myTools = new MyToolsClient(request, token);
  });

  // بعد كل تست: نحذف كل أداة اسمها بيبدأ ببادئة QA.
  test.afterEach(async () => {
    // نقرا القايمة.
    const groups = (await (await myTools.listMyTools()).json()).data.tools as Group[];
    // نحذف نسخ QA بس.
    for (const group of groups) {
      for (const instance of group.instances) {
        if (instance.display_name.startsWith(qaPrefix)) {
          await myTools.deleteTool(instance.id);
        }
      }
    }
  });

  // نضيف أداة، نلاقيها في القايمة، وبعدين نحذفها.
  test('add, list and delete a tool', { tag: '@smoke' }, async () => {
    // نضيف الأداة باسم QA.
    const name = newQaToolName();
    const added = await myTools.addTool(toolToAdd.id, addToolBody(name));
    // المتوقع: 200 ومفتاح النجاح.
    expect(added.status()).toBe(200);
    const addedBody = await added.json();
    expect(addedBody.key).toBe('tool_configration_saved');
    expect(addedBody.data.name).toBe(name);
    const id = addedBody.data.id as number;
    // المتوقع: القايمة فيها الأداة الجديدة مفعّلة.
    const groups = (await (await myTools.listMyTools()).json()).data.tools as Group[];
    const instance = groups.flatMap((g) => g.instances).find((i) => i.id === id);
    expect(instance?.display_name).toBe(name);
    expect(instance?.status).toBe('active');
    // نحذفها.
    const deleted = await myTools.deleteTool(id);
    // المتوقع: 200 ومفتاح النجاح، والأداة مبقتش في القايمة.
    expect(deleted.status()).toBe(200);
    expect((await deleted.json()).key).toBe('tool_deleted');
    const after = (await (await myTools.listMyTools()).json()).data.tools as Group[];
    expect(after.flatMap((g) => g.instances).some((i) => i.id === id)).toBe(false);
  });

  // GET /tools/my/{id} بيرجّع الأداة المتضافة.
  test('get one added tool', { tag: '@regression' }, async () => {
    // نضيف أداة.
    const name = newQaToolName();
    const id = (await (await myTools.addTool(toolToAdd.id, addToolBody(name))).json()).data.id as number;
    // ننده GET /tools/my/{id}.
    const response = await myTools.getMyTool(id);
    // المتوقع: 200 ونفس الأداة.
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toBe('merchant_tool_success');
    expect(body.data.display_name).toBe(name);
    expect(body.data.tool.id).toBe(toolToAdd.id);
  });

  // أجسام الإضافة الغلط بترجّع 422.
  test('invalid add payloads return 422', { tag: '@regression' }, async () => {
    // نبعت كل جسم غلط.
    for (const body of invalidAddToolBodies) {
      expect((await myTools.addTool(toolToAdd.id, body)).status(), JSON.stringify(body)).toBe(422);
    }
  });

  // إضافة أداة مش موجودة في الكتالوج بترجّع 404.
  test('add with unknown tool id returns 404', { tag: '@regression' }, async () => {
    expect((await myTools.addTool(unknownId, addToolBody(newQaToolName()))).status()).toBe(404);
  });

  // حذف أداة مش بتاعة التاجر بيرجّع 403 (حسب الـ OpenAPI)، وممكن id مش موجود يرجّع 404 كمان.
  test('delete with unknown id is refused', { tag: '@regression' }, async () => {
    expect([403, 404]).toContain((await myTools.deleteTool(unknownId)).status());
  });

  // حذف نفس الأداة مرتين: الطلب التاني بيترفض.
  test('delete twice is refused the second time', { tag: '@regression' }, async () => {
    // نضيف ونحذف مرة.
    const id = (await (await myTools.addTool(toolToAdd.id, addToolBody(newQaToolName()))).json()).data.id as number;
    expect((await myTools.deleteTool(id)).status()).toBe(200);
    // المتوقع: الحذف التاني بيترفض.
    expect([403, 404]).toContain((await myTools.deleteTool(id)).status());
  });

  // كل الـ endpoints محتاجة توكن.
  test('my tools endpoints without token return 401', { tag: '@critical' }, async ({ request }) => {
    // عميل بتوكن فاضي.
    const noToken = new MyToolsClient(request, '');
    // المتوقع: 401 في كل الـ endpoints.
    expect((await noToken.listMyTools()).status()).toBe(401);
    expect((await noToken.getMyTool(1)).status()).toBe(401);
    expect((await noToken.addTool(toolToAdd.id, addToolBody(newQaToolName()))).status()).toBe(401);
    expect((await noToken.deleteTool(1)).status()).toBe(401);
  });
});
