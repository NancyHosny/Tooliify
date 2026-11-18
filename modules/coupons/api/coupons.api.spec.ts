// نستورد test و expect من Playwright (الـ fixture اسمه "request" هو اللي بيبعت طلبات الـ API).
import { test, expect } from '../../shared/bug-capture';
// نستورد عميل الكوبونات وأدوات QA المساعدة.
import { CouponsClient } from '../clients/CouponsClient';
import { createCouponsClient, addQaCoupon, deleteQaCoupons } from '../clients/qa-coupons';
// نستورد بيانات التست.
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
    // نعمل كوبون QA وننده القايمة.
    const coupon = await addQaCoupon(api);
    const response = await api.list();
    // المتوقع: 200 ومفتاح النجاح.
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toBe(couponApi.fetchedKey);
    // المتوقع: الكوبون الجديد في القايمة بحقوله.
    const item = (body.data.items as Coupon[]).find((row) => row.id === coupon.id)!;
    expect(item.name).toBe(coupon.name);
    expect(item.coupon_code).toBe(coupon.code);
    expect(item.type).toBe('percentage');
    expect(item.status).toBe('active');
    expect(item.discount_percentage).toBe(10);
    // المتوقع: بيانات الصفحات والمزامنة موجودة.
    expect(body.data.pagination.total).toBeGreaterThanOrEqual(1);
    expect(body.data.sync).toHaveProperty('last_success_at');
  });

  // البحث بالاسم وبالرمز بيلاقي الكوبون، وكلمة غلط بترجّع قايمة فاضية.
  test('search finds the coupon by name and by code', { tag: '@regression' }, async () => {
    // نعمل كوبون QA.
    const coupon = await addQaCoupon(api);
    // المتوقع: البحث بالاسم وبالرمز بيرجّعه.
    for (const term of [coupon.name, coupon.code]) {
      const items = (await (await api.list({ 'filter[search]': term })).json()).data.items as Coupon[];
      expect(items.map((item) => item.id), term).toContain(coupon.id);
    }
    // المتوقع: كلمة مش موجودة بترجّع قايمة فاضية.
    expect((await (await api.list({ 'filter[search]': 'zzzqqq' })).json()).data.items).toEqual([]);
  });

  // فلتر الحالة: الكوبون المفعّل بيظهر في active ومبيظهرش في disabled.
  test('status filter separates active and disabled coupons', { tag: '@regression' }, async () => {
    // نعمل كوبون QA مفعّل.
    const coupon = await addQaCoupon(api);
    // المتوقع: ظاهر في active.
    const active = (await (await api.list({ 'filter[status]': 'active' })).json()).data.items as Coupon[];
    expect(active.map((item) => item.id)).toContain(coupon.id);
    // المتوقع: مش ظاهر في disabled.
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
    // نجرّب قيمة مش معروفة.
    const response = await api.list({ 'filter[status]': 'zzz' });
    // المتوقع: 422.
    expect(response.status()).toBe(422);
  });

  // فلتر تاريخ الإنشاء بيرجّع كوبون النهارده.
  test('created_from and created_to filters return today\'s coupon', { tag: '@regression' }, async () => {
    // نعمل كوبون QA.
    const coupon = await addQaCoupon(api);
    // نفلتر بتاريخ النهارده.
    const today = new Date().toISOString().slice(0, 10);
    const items = (await (await api.list({ 'filter[created_from]': today, 'filter[created_to]': today })).json()).data.items as Coupon[];
    // المتوقع: الكوبون الجديد في النتيجة.
    expect(items.map((item) => item.id)).toContain(coupon.id);
  });

  // قايمة الاختيار للأدوات بتضم الكوبون المفعّل.
  test('selectable list includes an active coupon', { tag: '@regression' }, async () => {
    // نعمل كوبون QA مفعّل.
    const coupon = await addQaCoupon(api);
    // ننده قايمة الاختيار بالبحث باسمه.
    const response = await api.listSelectable(coupon.name);
    // المتوقع: 200 والكوبون في القايمة.
    expect(response.status()).toBe(200);
    const items = (await response.json()).data as { id: number }[];
    expect(items.map((item) => item.id)).toContain(coupon.id);
  });

  // ---------- توليد الرمز ----------

  // توليد الرمز بيرجّع رمز بادئته TFY- وكل مرة رمز مختلف.
  test('generate-code returns a new TFY- code every time', { tag: '@regression' }, async () => {
    // ننده التوليد مرتين.
    const first = await api.generateCode();
    const second = await api.generateCode();
    // المتوقع: 200 ومفتاح النجاح ورمز بالشكل الصحيح.
    expect(first.status()).toBe(200);
    const firstBody = await first.json();
    expect(firstBody.key).toBe(couponApi.codeKey);
    expect(firstBody.data.code).toMatch(/^TFY-[A-Za-z0-9]+$/);
    // المتوقع: الرمز التاني مختلف.
    expect((await second.json()).data.code).not.toBe(firstBody.data.code);
  });

  // ---------- إنشاء كوبون ----------

  // إنشاء كوبون نسبة مئوية صحيح.
  test('valid percentage coupon is created', { tag: '@smoke' }, async () => {
    // نبعت جسم صحيح.
    const body = couponBody();
    const response = await api.create(body);
    // المتوقع: 201 ومفتاح النجاح.
    expect(response.status()).toBe(201);
    const json = await response.json();
    expect(json.key).toBe(couponApi.createdKey);
    // المتوقع: الكوبون راجع ببياناته.
    expect(json.data.name).toBe(body.name);
    expect(json.data.coupon_code).toBe(body.code);
    expect(json.data.type).toBe('percentage');
    expect(json.data.discount_percentage).toBe(10);
    expect(json.data.status).toBe('active');
  });

  // إنشاء كوبون مبلغ ثابت صحيح (الحد الأدنى للشراء أكبر من الخصم).
  test('valid fixed coupon is created', { tag: '@regression' }, async () => {
    // نبعت جسم مبلغ ثابت صحيح.
    const response = await api.create(fixedCouponBody());
    // المتوقع: 201 والنوع fixed.
    expect(response.status()).toBe(201);
    expect((await response.json()).data.type).toBe('fixed');
  });

  // رمز من غير بادئة TFY- بيتحفظ ببادئة TFY- (الـ OpenAPI بيقول إن البادئة بتتضاف أوتوماتيك).
  test('a code without the TFY- prefix is saved with the prefix', { tag: '@regression' }, async () => {
    // نبعت رمز من غير بادئة.
    const response = await api.create(couponBody({ code: newQaCouponCode().replace('TFY-', '') }));
    // المتوقع: 201 والرمز بادئته TFY-.
    expect(response.status()).toBe(201);
    expect((await response.json()).data.coupon_code).toMatch(/^TFY-/);
  });

  // الأجسام الغلط بترجّع 422 (ورسالتها العربي لو الـ API بيرجّعها عربي).
  for (const item of invalidCouponBodies) {
    test(`invalid coupon is rejected: ${item.name}`, { tag: '@regression' }, async () => {
      // نبعت الجسم الغلط.
      const response = await api.create(couponBody(item.changes));
      // المتوقع: 422.
      expect(response.status()).toBe(422);
      if (item.message) expect((await response.json()).msg).toBe(item.message);
    });
  }

  // جسم فاضي بيرجّع 422.
  test('empty body is rejected', { tag: '@regression' }, async () => {
    // نبعت جسم فاضي.
    const response = await api.create({});
    // المتوقع: 422.
    expect(response.status()).toBe(422);
  });

  // رمز كوبون موجود قبل كده بيترفض.
  test('a code that already exists is rejected', { tag: '@regression' }, async () => {
    // نعمل كوبون وبعدين كوبون تاني بنفس الرمز.
    const coupon = await addQaCoupon(api);
    const response = await api.create(couponBody({ code: coupon.code }));
    // المتوقع: 422 ورسالة "موجود بالفعل".
    expect(response.status()).toBe(422);
    expect((await response.json()).msg).toBe(couponApi.duplicateMessage);
  });

  // ---------- عرض كوبون ----------

  // عرض كوبون بيرجّع نفس بياناته.
  test('show returns the coupon', { tag: '@regression' }, async () => {
    // نعمل كوبون QA وننده GET بالـ id.
    const coupon = await addQaCoupon(api);
    const response = await api.get(coupon.id);
    // المتوقع: 200 ومفتاح النجاح ونفس الكوبون.
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toBe(couponApi.shownKey);
    expect(body.data.id).toBe(coupon.id);
    expect(body.data.coupon_code).toBe(coupon.code);
  });

  // عرض كوبون مش موجود بيرجّع 404.
  test('show with an unknown id returns 404', { tag: '@regression' }, async () => {
    // ننده GET بـ id مش موجود.
    const response = await api.get(unknownId);
    // المتوقع: 404.
    expect(response.status()).toBe(404);
  });

  // ---------- تعديل كوبون ----------

  // تعديل الاسم بيتحفظ.
  test('update changes the name', { tag: '@smoke' }, async () => {
    // نعمل كوبون QA ونغيّر اسمه.
    const coupon = await addQaCoupon(api);
    const newName = `${coupon.name}-edited`;
    const response = await api.update(coupon.id, { name: newName });
    // المتوقع: 200 ومفتاح النجاح والاسم الجديد.
    expect(response.status()).toBe(200);
    expect((await response.json()).key).toBe(couponApi.updatedKey);
    expect((await (await api.get(coupon.id)).json()).data.name).toBe(newName);
  });

  // تعديل بقيمة غلط بيرجّع 422 والكوبون مبيتغيّرش.
  test('update with a wrong discount is rejected', { tag: '@regression' }, async () => {
    // نعمل كوبون QA ونبعت خصم 0.
    const coupon = await addQaCoupon(api);
    const response = await api.update(coupon.id, { discount: 0 });
    // المتوقع: 422 والخصم لسه 10.
    expect(response.status()).toBe(422);
    expect((await (await api.get(coupon.id)).json()).data.discount_percentage).toBe(10);
  });

  // تعديل كوبون مش موجود بيرجّع 404.
  test('update with an unknown id returns 404', { tag: '@regression' }, async () => {
    // نعدّل id مش موجود.
    const response = await api.update(unknownId, { name: 'QA-unknown' });
    // المتوقع: 404.
    expect(response.status()).toBe(404);
  });

  // ---------- تفعيل وإيقاف ----------

  // إيقاف الكوبون وتفعيله تاني.
  test('a coupon can be disabled and activated again', { tag: '@smoke' }, async () => {
    // نعمل كوبون QA مفعّل ونوقفه.
    const coupon = await addQaCoupon(api);
    const disabled = await api.setStatus(coupon.id, { status: 'disabled' });
    // المتوقع: 200 ومفتاح النجاح والحالة disabled.
    expect(disabled.status()).toBe(200);
    expect((await disabled.json()).key).toBe(couponApi.statusKey);
    expect((await (await api.get(coupon.id)).json()).data.status).toBe('disabled');
    // نفعّله تاني.
    const active = await api.setStatus(coupon.id, { status: 'active' });
    // المتوقع: 200 والحالة active.
    expect(active.status()).toBe(200);
    expect((await (await api.get(coupon.id)).json()).data.status).toBe('active');
  });

  // الكوبون المجدول (لسه مبدأش) مينفعش يتفعّل.
  test('a scheduled coupon cannot be activated', { tag: '@regression' }, async () => {
    // نعمل كوبون بيبدأ في 2030 ونحاول نفعّله.
    const coupon = await addQaCoupon(api, scheduledCouponBody());
    const response = await api.setStatus(coupon.id, { status: 'active' });
    // المتوقع: 422 ورسالة "لا يمكن تفعيل كوبون مجدول...".
    expect(response.status()).toBe(422);
    const body = await response.json();
    expect(body.key).toBe(couponApi.cannotActivateKey);
    expect(body.msg).toBe(couponApi.cannotActivateMessage);
  });

  // حالة غلط أو ناقصة بترجّع 422.
  test('status with a wrong or missing value is rejected', { tag: '@regression' }, async () => {
    // نعمل كوبون QA.
    const coupon = await addQaCoupon(api);
    // المتوقع: حالة مش معروفة وجسم فاضي بيرجّعوا 422.
    expect((await api.setStatus(coupon.id, { status: 'zzz' })).status()).toBe(422);
    expect((await api.setStatus(coupon.id, {})).status()).toBe(422);
  });

  // تغيير حالة كوبون مش موجود بيرجّع 404.
  test('status of an unknown coupon returns 404', { tag: '@regression' }, async () => {
    // نغيّر حالة id مش موجود.
    const response = await api.setStatus(unknownId, { status: 'active' });
    // المتوقع: 404.
    expect(response.status()).toBe(404);
  });

  // ---------- حذف كوبون ----------

  // الحذف بيشيل الكوبون، وحذفه تاني بيرجّع 404.
  test('delete removes the coupon and deleting it again returns 404', { tag: '@smoke' }, async () => {
    // نعمل كوبون QA ونحذفه.
    const coupon = await addQaCoupon(api);
    const response = await api.remove(coupon.id);
    // المتوقع: 200 ومفتاح الحذف والكوبون مبقاش موجود.
    expect(response.status()).toBe(200);
    expect((await response.json()).key).toBe(couponApi.deletedKey);
    expect((await api.get(coupon.id)).status()).toBe(404);
    // المتوقع: حذفه تاني بيرجّع 404.
    expect((await api.remove(coupon.id)).status()).toBe(404);
  });

  // حذف كوبون مش موجود بيرجّع 404.
  test('delete with an unknown id returns 404', { tag: '@regression' }, async () => {
    // نحذف id مش موجود.
    const response = await api.remove(unknownId);
    // المتوقع: 404.
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
      // عميل بالتوكن ده.
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
