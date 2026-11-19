import { test, expect } from '../../shared/bug-capture';
import { CouponsClient } from '../clients/CouponsClient';
import { createCouponsClient, addQaCoupon, deleteQaCoupons } from '../clients/qa-coupons';
import {
  apiUrl, unknownId, couponBody, fixedCouponBody, scheduledCouponBody, invalidCouponBodies, couponStatuses, couponSources,
  couponApi, newQaCouponCode, fakeJwt,
} from '../../../test-data/test-data';

// كوبون واحد من رد الـ API (الحقول اللي بنفحصها).
type Coupon = {
  id: number; name: string; coupon_code: string; origin: string; type: string; status: string;
  discount_percentage: number; max_discount_amount: number | null; can_activate: boolean;
};

// تستات API للكوبونات (تاج الـ OpenAPI: "Coupons"). الكوبونات بتتعمل على متجرك الحقيقي (سلة)،
// فكل تست بيحذف كوبونات QA بتاعته بعد ما يخلص، وكوبوناتك الحقيقية مبتتلمسش.
test.describe('Coupons – API', () => {
  // نتخطى كل التستات لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // عميل الكوبونات (بيتعمل من جديد لكل تست).
  let api: CouponsClient;

  // قبل كل تست: نسجّل دخول ونعمل العميل.
  test.beforeEach(async ({ request }) => {
    api = await createCouponsClient(request);
  });

  // بعد كل تست: نحذف كل كوبون اسمه بيبدأ ببادئة QA.
  test.afterEach(async () => {
    if (api) await deleteQaCoupons(api);
  });

  // ---------- القايمة والبحث والفلاتر ----------

  // القايمة بترجّع الكوبون الجديد بكل حقوله، ومعاها بيانات الصفحات والمزامنة.
  test('list returns the coupon with its data', { tag: '@smoke' }, async () => {
    const coupon = await addQaCoupon(api);
    const response = await api.list();
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toBe(couponApi.fetchedKey);
    const item = (body.data.items as Coupon[]).find((row) => row.id === coupon.id)!;
    expect(item.name).toBe(coupon.name);
    expect(item.coupon_code).toBe(coupon.code);
    expect(item.type).toBe('percentage');
    expect(item.status).toBe('active');
    expect(item.discount_percentage).toBe(10);
    expect(body.data.pagination.total).toBeGreaterThanOrEqual(1);
    expect(body.data.sync).toHaveProperty('last_success_at');
  });

  // البحث بالاسم وبالرمز بيلاقي الكوبون، وكلمة غلط بترجّع قايمة فاضية.
  test('search finds the coupon by name and by code', { tag: '@regression' }, async () => {
    const coupon = await addQaCoupon(api);
    // المتوقع: البحث بالاسم وبالرمز بيرجّعه.
    for (const term of [coupon.name, coupon.code]) {
      const items = (await (await api.list({ 'filter[search]': term })).json()).data.items as Coupon[];
      expect(items.map((item) => item.id), term).toContain(coupon.id);
    }
    expect((await (await api.list({ 'filter[search]': 'zzzqqq' })).json()).data.items).toEqual([]);
  });

  // فلتر الحالة: الكوبون المفعّل بيظهر في active ومبيظهرش في disabled.
  test('status filter separates active and disabled coupons', { tag: '@regression' }, async () => {
    const coupon = await addQaCoupon(api);
    const active = (await (await api.list({ 'filter[status]': 'active' })).json()).data.items as Coupon[];
    expect(active.map((item) => item.id)).toContain(coupon.id);
    const disabled = (await (await api.list({ 'filter[status]': 'disabled' })).json()).data.items as Coupon[];
    expect(disabled.map((item) => item.id)).not.toContain(coupon.id);
  });

  // كل قيم فلتر الحالة وفلتر المصدر المكتوبة في الـ OpenAPI بترجّع 200.
  test('every documented status and source filter is accepted', { tag: '@regression' }, async () => {
    // نجرّب كل حالة.
    for (const status of couponStatuses) {
      expect((await api.list({ 'filter[status]': status })).status(), status).toBe(200);
    }
    // نجرّب كل مصدر.
    for (const source of couponSources) {
      expect((await api.list({ 'filter[source]': source })).status(), source).toBe(200);
    }
  });

  // فلتر الحالة بيرفض قيمة مش موجودة في الـ OpenAPI.
  test('status filter rejects an unknown value', { tag: '@regression' }, async () => {
    const response = await api.list({ 'filter[status]': 'zzz' });
    expect(response.status()).toBe(422);
  });

  // فلتر تاريخ الإنشاء بيرجّع كوبون النهارده.
  test('created_from and created_to filters return today\'s coupon', { tag: '@regression' }, async () => {
    const coupon = await addQaCoupon(api);
    const today = new Date().toISOString().slice(0, 10);
    const items = (await (await api.list({ 'filter[created_from]': today, 'filter[created_to]': today })).json()).data.items as Coupon[];
    expect(items.map((item) => item.id)).toContain(coupon.id);
  });

  // قايمة الاختيار للأدوات بتضم الكوبون المفعّل.
  test('selectable list includes an active coupon', { tag: '@regression' }, async () => {
    const coupon = await addQaCoupon(api);
    const response = await api.listSelectable(coupon.name);
    expect(response.status()).toBe(200);
    const items = (await response.json()).data as { id: number }[];
    expect(items.map((item) => item.id)).toContain(coupon.id);
  });

  // ---------- توليد الرمز ----------

  // توليد الرمز بيرجّع رمز بادئته TFY- وكل مرة رمز مختلف.
  test('generate-code returns a new TFY- code every time', { tag: '@regression' }, async () => {
    const first = await api.generateCode();
    const second = await api.generateCode();
    expect(first.status()).toBe(200);
    const firstBody = await first.json();
    expect(firstBody.key).toBe(couponApi.codeKey);
    expect(firstBody.data.code).toMatch(/^TFY-[A-Za-z0-9]+$/);
    expect((await second.json()).data.code).not.toBe(firstBody.data.code);
  });

  // ---------- إنشاء كوبون ----------

  // إنشاء كوبون نسبة مئوية صحيح.
  test('valid percentage coupon is created', { tag: '@smoke' }, async () => {
    const body = couponBody();
    const response = await api.create(body);
    expect(response.status()).toBe(201);
    const json = await response.json();
    expect(json.key).toBe(couponApi.createdKey);
    expect(json.data.name).toBe(body.name);
    expect(json.data.coupon_code).toBe(body.code);
    expect(json.data.type).toBe('percentage');
    expect(json.data.discount_percentage).toBe(10);
    expect(json.data.status).toBe('active');
  });

  // إنشاء كوبون مبلغ ثابت صحيح (الحد الأدنى للشراء أكبر من الخصم).
  test('valid fixed coupon is created', { tag: '@regression' }, async () => {
    const response = await api.create(fixedCouponBody());
    expect(response.status()).toBe(201);
    expect((await response.json()).data.type).toBe('fixed');
  });

  // رمز من غير بادئة TFY- بيتحفظ ببادئة TFY- (الـ OpenAPI بيقول إن البادئة بتتضاف أوتوماتيك).
  test('a code without the TFY- prefix is saved with the prefix', { tag: '@regression' }, async () => {
    const response = await api.create(couponBody({ code: newQaCouponCode().replace('TFY-', '') }));
    expect(response.status()).toBe(201);
    expect((await response.json()).data.coupon_code).toMatch(/^TFY-/);
  });

  // الأجسام الغلط بترجّع 422 (ورسالتها العربي لو الـ API بيرجّعها عربي).
  for (const item of invalidCouponBodies) {
    test(`invalid coupon is rejected: ${item.name}`, { tag: '@regression' }, async () => {
      const response = await api.create(couponBody(item.changes));
      expect(response.status()).toBe(422);
      if (item.message) expect((await response.json()).msg).toBe(item.message);
    });
  }

  // جسم فاضي بيرجّع 422.
  test('empty body is rejected', { tag: '@regression' }, async () => {
    const response = await api.create({});
    expect(response.status()).toBe(422);
  });

  // رمز كوبون موجود قبل كده بيترفض.
  test('a code that already exists is rejected', { tag: '@regression' }, async () => {
    const coupon = await addQaCoupon(api);
    const response = await api.create(couponBody({ code: coupon.code }));
    expect(response.status()).toBe(422);
    expect((await response.json()).msg).toBe(couponApi.duplicateMessage);
  });

  // ---------- عرض كوبون ----------

  // عرض كوبون بيرجّع نفس بياناته.
  test('show returns the coupon', { tag: '@regression' }, async () => {
    const coupon = await addQaCoupon(api);
    const response = await api.get(coupon.id);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toBe(couponApi.shownKey);
    expect(body.data.id).toBe(coupon.id);
    expect(body.data.coupon_code).toBe(coupon.code);
  });

  // عرض كوبون مش موجود بيرجّع 404.
  test('show with an unknown id returns 404', { tag: '@regression' }, async () => {
    const response = await api.get(unknownId);
    expect(response.status()).toBe(404);
  });

  // ---------- تعديل كوبون ----------

  // تعديل الاسم بيتحفظ.
  test('update changes the name', { tag: '@smoke' }, async () => {
    const coupon = await addQaCoupon(api);
    const newName = `${coupon.name}-edited`;
    const response = await api.update(coupon.id, { name: newName });
    expect(response.status()).toBe(200);
    expect((await response.json()).key).toBe(couponApi.updatedKey);
    expect((await (await api.get(coupon.id)).json()).data.name).toBe(newName);
  });

  // تعديل بقيمة غلط بيرجّع 422 والكوبون مبيتغيّرش.
  test('update with a wrong discount is rejected', { tag: '@regression' }, async () => {
    const coupon = await addQaCoupon(api);
    const response = await api.update(coupon.id, { discount: 0 });
    expect(response.status()).toBe(422);
    expect((await (await api.get(coupon.id)).json()).data.discount_percentage).toBe(10);
  });

  // تعديل كوبون مش موجود بيرجّع 404.
  test('update with an unknown id returns 404', { tag: '@regression' }, async () => {
    const response = await api.update(unknownId, { name: 'QA-unknown' });
    expect(response.status()).toBe(404);
  });

  // ---------- تفعيل وإيقاف ----------

  // إيقاف الكوبون وتفعيله تاني.
  test('a coupon can be disabled and activated again', { tag: '@smoke' }, async () => {
    const coupon = await addQaCoupon(api);
    const disabled = await api.setStatus(coupon.id, { status: 'disabled' });
    expect(disabled.status()).toBe(200);
    expect((await disabled.json()).key).toBe(couponApi.statusKey);
    expect((await (await api.get(coupon.id)).json()).data.status).toBe('disabled');
    const active = await api.setStatus(coupon.id, { status: 'active' });
    expect(active.status()).toBe(200);
    expect((await (await api.get(coupon.id)).json()).data.status).toBe('active');
  });

  // الكوبون المجدول (لسه مبدأش) مينفعش يتفعّل.
  test('a scheduled coupon cannot be activated', { tag: '@regression' }, async () => {
    const coupon = await addQaCoupon(api, scheduledCouponBody());
    const response = await api.setStatus(coupon.id, { status: 'active' });
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.key).toBe(couponApi.cannotActivateKey);
    expect(body.msg).toBe(couponApi.cannotActivateMessage);
  });

  // حالة غلط أو ناقصة بترجّع 422.
  test('status with a wrong or missing value is rejected', { tag: '@regression' }, async () => {
    const coupon = await addQaCoupon(api);
    expect((await api.setStatus(coupon.id, { status: 'zzz' })).status()).toBe(422);
    expect((await api.setStatus(coupon.id, {})).status()).toBe(422);
  });

  // تغيير حالة كوبون مش موجود بيرجّع 404.
  test('status of an unknown coupon returns 404', { tag: '@regression' }, async () => {
    const response = await api.setStatus(unknownId, { status: 'active' });
    expect(response.status()).toBe(404);
  });

  // ---------- حذف كوبون ----------

  // الحذف بيشيل الكوبون، وحذفه تاني بيرجّع 404.
  test('delete removes the coupon and deleting it again returns 404', { tag: '@smoke' }, async () => {
    const coupon = await addQaCoupon(api);
    const response = await api.remove(coupon.id);
    expect(response.status()).toBe(200);
    expect((await response.json()).key).toBe(couponApi.deletedKey);
    expect((await api.get(coupon.id)).status()).toBe(404);
    expect((await api.remove(coupon.id)).status()).toBe(404);
  });

  // حذف كوبون مش موجود بيرجّع 404.
  test('delete with an unknown id returns 404', { tag: '@regression' }, async () => {
    const response = await api.remove(unknownId);
    expect(response.status()).toBe(404);
  });

  // ---------- التوكن ----------

  // كل endpoints الكوبونات محتاجة توكن: فاضي أو مزيّف بيرجّعوا 401.
  // (الطلبات هنا من غير هيدر Accept: application/json، والـ API بيرجّع 500 بدل 401 لما الهيدر ده مش موجود.)
  for (const item of [
    { name: 'empty token', token: '' },
    { name: 'fake token', token: fakeJwt },
  ]) {
    test(`coupons endpoints with ${item.name} return 401`, { tag: '@critical' }, async ({ request }) => {
      const client = new CouponsClient(request, item.token);
      // المتوقع: 401 في كل endpoint (expect.soft عشان نشوف كل اللي فشل مش أول واحد بس).
      expect.soft((await client.list()).status(), 'list').toBe(401);
      expect.soft((await client.listSelectable()).status(), 'list selectable').toBe(401);
      expect.soft((await client.generateCode()).status(), 'generate code').toBe(401);
      expect.soft((await client.create(couponBody())).status(), 'create').toBe(401);
      expect.soft((await client.get(unknownId)).status(), 'show').toBe(401);
      expect.soft((await client.update(unknownId, {})).status(), 'update').toBe(401);
      expect.soft((await client.setStatus(unknownId, { status: 'active' })).status(), 'status').toBe(401);
      expect.soft((await client.remove(unknownId)).status(), 'delete').toBe(401);
    });
  }
});
