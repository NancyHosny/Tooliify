// نستورد test و expect من Playwright (الـ fixture اسمه "request" هو اللي بيبعت طلبات الـ API).
import fs from 'node:fs';
import { test, expect } from '../../shared/bug-capture';
// نستورد أدوات QA المساعدة.
import { createStoreClients, addMarkedCookiesTool, addQaReviewsTool, deleteQaTools } from '../clients/qa-store-tools';
import { sleep } from '../../dashboard/clients/rate-limit';
// نستورد بيانات التست.
import {
  apiUrl, unknownId, trackBody, trackingEvents, invalidTrackingEvents, validReview, invalidReviews,
  reviewImage, htmlComment, storefrontApi,
} from '../../../test-data/test-data';

// تستات API للـ endpoints اللي سكريبت Tooliify بينده عليها من جوه المتجر (كلها عامة، من غير توكن):
// تسجيل حدث واحد، إرسال تقييم، وإصدار كوبون تلقائي. كل التستات بتتعمل على أدوات QA بتتحذف في الآخر.
test.describe('Storefront – API', () => {
  // نتخطى كل التستات لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // العملاء وأدوات QA (أداة كوكيز وأداة آراء عملاء) بتتعمل مرة واحدة لكل التستات.
  let clients: Awaited<ReturnType<typeof createStoreClients>>;
  let cookies: { id: number };
  let reviews: { id: number };

  // مرة واحدة قبل التستات: نضيف الأدوات.
  test.beforeAll(async ({ playwright }) => {
    clients = await createStoreClients(await playwright.request.newContext({ baseURL: apiUrl }));
    cookies = await addMarkedCookiesTool(clients.myTools);
    reviews = await addQaReviewsTool(clients.myTools);
  });

  // مرة واحدة بعد التستات: نحذف كل أدوات QA.
  test.afterAll(async () => {
    if (clients) await deleteQaTools(clients.myTools);
  });

  // ---------- تسجيل حدث واحد (POST /tracking/tools/{id}) ----------

  // كل حدث من الأحداث الخمسة بيتقبل.
  for (const event of trackingEvents) {
    test(`tracking accepts the event: ${event}`, { tag: '@regression' }, async () => {
      // نبعت الحدث.
      const response = await clients.storefront.trackOne(cookies.id, { event });
      // المتوقع: 202 (اتقبل للمعالجة).
      expect(response.status()).toBe(202);
    });
  }

  // أحداث غلط.
  for (const item of invalidTrackingEvents) {
    test(`tracking rejects an invalid event: ${item.name}`, { tag: '@regression' }, async () => {
      // المتوقع: 422.
      expect((await clients.storefront.trackOne(cookies.id, item.body)).status()).toBe(422);
    });
  }

  // أداة مش موجودة.
  test('tracking an unknown tool returns 404', { tag: '@regression' }, async () => {
    expect((await clients.storefront.trackOne(unknownId, { event: 'view' })).status()).toBe(404);
  });

  // ---------- التقييمات (POST /customer-reviews) ----------

  // تقييم صحيح بيتقبل وبيظهر في إعدادات الأداة.
  test('a valid review is stored and shown in the tool settings', { tag: '@smoke' }, async () => {
    // نبعت تقييم صحيح.
    const response = await clients.storefront.submitReview({ merchant_tool_id: String(reviews.id), ...validReview });
    // المتوقع: 201 ومفتاح النجاح وبيانات التقييم.
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.key).toBe(storefrontApi.reviewKey);
    expect(body.data.name).toBe(validReview.name);
    expect(body.data.rating).toBe(Number(validReview.rating));
    expect(body.data.comment).toBe(validReview.comment);
    // المتوقع: التقييم موجود في إعدادات الأداة.
    const config = (await (await clients.myTools.getConfigurations(reviews.id)).json()).data.config;
    expect(config.customer_reviews.some((item: { comment: string }) => item.comment === validReview.comment)).toBe(true);
  });

  // التقييم ممكن يتبعت معاه صورة.
  test('a review with an image is stored with the image address', { tag: '@regression' }, async () => {
    // رفع الصورة على التخزين الخارجي بطيء (ممكن ياخد أكتر من نص دقيقة).
    test.setTimeout(150_000);
    // نبعت تقييم معاه صورة.
    const image = { name: reviewImage.name, mimeType: reviewImage.mimeType, buffer: fs.readFileSync(reviewImage.file) };
    const response = await clients.storefront.submitReview({ merchant_tool_id: String(reviews.id), ...validReview, image });
    // المتوقع: 201 وعنوان الصورة.
    expect(response.status()).toBe(201);
    expect((await response.json()).data.image).toMatch(/^https:\/\//);
  });

  // ملف مش صورة بيترفض.
  test('a review with a file that is not an image is rejected', { tag: '@regression' }, async () => {
    // نبعت ملف نصي كأنه صورة.
    const image = { name: 'qa.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') };
    const response = await clients.storefront.submitReview({ merchant_tool_id: String(reviews.id), ...validReview, image });
    // المتوقع: 422.
    expect(response.status()).toBe(422);
  });

  // تقييمات غلط: كل واحد بنبدّل فيه حقل واحد.
  for (const item of invalidReviews) {
    test(`a review is rejected: ${item.name}`, { tag: '@regression' }, async () => {
      // نبني التقييم الصحيح ونبدّل الحقل (null = نشيله).
      const fields: Record<string, string> = { merchant_tool_id: String(reviews.id), ...validReview };
      for (const [key, value] of Object.entries(item.change)) {
        if (value === null) delete fields[key];
        else fields[key] = value;
      }
      // المتوقع: 422 ورسالة.
      const response = await clients.storefront.submitReview(fields);
      expect(response.status()).toBe(422);
      expect((await response.json()).msg).toBeTruthy();
    });
  }

  // كود HTML في التعليق: السيرفر لازم ينضّفه أو يرفضه، مش يخزنه زي ما هو (التعليق بيتعرض لزوار المتجر).
  test('a review comment with HTML code is not stored as it is', { tag: '@security' }, async () => {
    // نبعت تعليق فيه وسم img بحدث onerror.
    const response = await clients.storefront.submitReview({ merchant_tool_id: String(reviews.id), ...validReview, comment: htmlComment });
    // المتوقع: إما اترفض، أو اتخزن من غير الكود.
    if (response.status() === 201) expect((await response.json()).data.comment).not.toContain('onerror');
    else expect(response.status()).toBe(422);
  });

  // ---------- الكوبون التلقائي (POST /automatic-coupons) ----------
  // ملحوظة: الإصدار الناجح بيعمل كوبون حقيقي على متجر سلة، فبنجرّب الحالات الغلط بس.

  // من غير بيانات.
  test('automatic coupon without data is rejected', { tag: '@regression' }, async () => {
    expect((await clients.storefront.issueAutomaticCoupon({})).status()).toBe(422);
  });

  // من غير مفتاح الزائر.
  test('automatic coupon without a visitor key is rejected', { tag: '@regression' }, async () => {
    expect((await clients.storefront.issueAutomaticCoupon({ merchant_tool_id: cookies.id })).status()).toBe(422);
  });

  // أداة مش موجودة.
  test('automatic coupon for an unknown tool is rejected', { tag: '@regression' }, async () => {
    const response = await clients.storefront.issueAutomaticCoupon({ merchant_tool_id: unknownId, visitor_key: 'qa-visitor' });
    expect([404, 422]).toContain(response.status());
  });

  // أداة مش من أدوات الكوبونات.
  test('automatic coupon for a tool that is not a coupon tool is rejected', { tag: '@regression' }, async () => {
    // أداة الكوكيز مش بتصدر كوبونات.
    const response = await clients.storefront.issueAutomaticCoupon({ merchant_tool_id: cookies.id, visitor_key: 'qa-visitor' });
    expect(response.status(), await response.text()).toBe(422);
  });
});

// تستات الأدوات اللي بنغيّر حالتها (نوقفها) أو بنقيس أرقامها من الصفر: كل تست بيضيف أداة QA جديدة ويحذفها بعد كده.
// (أدوات الكوكيز وآراء العملاء مبتتضافش مرتين: لو اتضافت تاني الـ API بيرجّع نفس الأداة، فلازم نحذفها بين التستات.)
test.describe('Storefront – API with a tool of its own', () => {
  // نتخطى كل التستات لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // العملاء.
  let clients: Awaited<ReturnType<typeof createStoreClients>>;

  // قبل كل تست: نعمل العملاء (والأدوات بتتضاف جوه كل تست).
  test.beforeEach(async ({ playwright }) => {
    clients = await createStoreClients(await playwright.request.newContext({ baseURL: apiUrl }));
  });

  // بعد كل تست: نحذف كل أدوات QA.
  test.afterEach(async () => {
    if (clients) await deleteQaTools(clients.myTools);
  });

  // النقرة بتزوّد النقرات، والمرور بيزوّد المرور (على أداة جديدة عشان الأرقام تبدأ من صفر).
  test('a click and a view reach the tool statistics', { tag: '@regression' }, async () => {
    // نضيف أداة جديدة ونسجّل نقرة ومرور.
    const tool = await addMarkedCookiesTool(clients.myTools);
    await clients.storefront.trackOne(tool.id, { event: 'click' });
    await clients.storefront.trackOne(tool.id, { event: 'view' });
    // نستنى السيرفر يعالجهم، وبعدين نسأل كل 10 ثواني لحد دقيقة.
    await sleep(10_000);
    let values: Record<string, number> = {};
    for (let attempt = 0; attempt < 6; attempt++) {
      const stats = (await (await clients.statistics.toolFresh(tool.id, attempt)).json()).data.stats as { key: string; value: number }[];
      values = Object.fromEntries(stats.map((item) => [item.key, item.value]));
      if (values.clicks === 1 && values.views === 1) break;
      await sleep(10_000);
    }
    // المتوقع: نقرة واحدة ومرور واحد.
    expect(values.clicks).toBe(1);
    expect(values.views).toBe(1);
  });

  // ---------- أداة موقوفة ----------

  // الأداة الموقوفة مبتستقبلش حاجة من المتجر (404 في كل الـ endpoints).
  test('a stopped tool rejects tracking of one event', { tag: '@regression' }, async () => {
    // نوقف أداة جديدة.
    const tool = await addMarkedCookiesTool(clients.myTools);
    await clients.myTools.toggleTool(tool.id);
    // المتوقع: 404.
    expect((await clients.storefront.trackOne(tool.id, { event: 'view' })).status()).toBe(404);
  });

  test('a stopped tool rejects tracking of several events', { tag: '@regression' }, async () => {
    // نوقف أداة جديدة.
    const tool = await addMarkedCookiesTool(clients.myTools);
    await clients.myTools.toggleTool(tool.id);
    // المتوقع: 404.
    expect((await clients.statistics.track(trackBody(tool.id))).status()).toBe(404);
  });

  test('a stopped tool rejects reviews', { tag: '@regression' }, async () => {
    // نوقف أداة آراء جديدة.
    const tool = await addQaReviewsTool(clients.myTools);
    await clients.myTools.toggleTool(tool.id);
    // المتوقع: 404 ومفتاح "الأداة مش مضافة أو موقوفة".
    const response = await clients.storefront.submitReview({ merchant_tool_id: String(tool.id), ...validReview });
    expect(response.status()).toBe(404);
    expect((await response.json()).key).toBe(storefrontApi.toolNotAddedKey);
  });

});
