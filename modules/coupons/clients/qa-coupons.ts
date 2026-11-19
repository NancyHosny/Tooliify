import { APIRequestContext } from '@playwright/test';
import { getMerchantToken } from '../../shared/merchant-token';
import { CouponsClient } from './CouponsClient';
import { couponBody, qaPrefix } from '../../../test-data/test-data';

// الكوبونات بتتعمل على متجرك الحقيقي (سلة)، فكل تست بيعمل كوبون QA بالـ API ويحذفه بعد كده.
// الدوال دي بتعمل ده بسرعة من غير ما نفتح المتصفح، ومبتحذفش غير الكوبونات اللي اسمها بيبدأ بـ QA-.

// بنجيب توكن التاجر (مرة واحدة لكل الـ worker) وبنرجّع عميل الكوبونات.
export async function createCouponsClient(request: APIRequestContext) {
  return new CouponsClient(request, await getMerchantToken(request));
}

// بنعمل كوبون QA بالـ API (افتراضيًا مفعّل) ونرجّع الـ id والاسم والرمز.
export async function addQaCoupon(coupons: CouponsClient, body: ReturnType<typeof couponBody> = couponBody()) {
  const response = await coupons.create(body);
  if (response.status() !== 201) throw new Error(`Could not create the QA coupon: ${response.status()} ${await response.text()}`);
  const data = (await response.json()).data;
  return { id: data.id as number, name: data.name as string, code: data.coupon_code as string };
}

// بنحذف كل كوبون اسمه بيبدأ ببادئة QA (الكوبونات الحقيقية مبتتلمسش).
export async function deleteQaCoupons(coupons: CouponsClient) {
  const items = (await (await coupons.list({ 'filter[search]': qaPrefix })).json()).data.items as { id: number; name: string | null }[];
  for (const item of items) {
    if (item.name?.startsWith(qaPrefix)) await coupons.remove(item.id);
  }
}
