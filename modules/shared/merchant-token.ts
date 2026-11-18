// نستورد نوع Playwright الخاص بطلبات HTTP.
import { APIRequestContext } from '@playwright/test';
// نستورد عميل Auth (عشان نسجّل دخول) وبيانات التاجر.
import { AuthClient } from '../auth/clients/AuthClient';
import { validMerchant } from '../../test-data/test-data';

// توكن التاجر بيتجاب مرة واحدة ويتستخدم في كل التستات اللي بعدها (نفس الـ worker).
// لو كل تست سجّل دخول لوحده السيرفر بيرد بـ 429 (طلبات كتير)، خصوصًا في الموديولات اللي فيها عشرات التستات.
let cachedToken: Promise<string> | undefined;

// بنرجّع توكن التاجر: لو اتجاب قبل كده بنستخدمه، وإلا بنسجّل دخول ونحفظه.
export function getMerchantToken(request: APIRequestContext): Promise<string> {
  cachedToken ??= new AuthClient(request).getToken(validMerchant.email, validMerchant.password).catch((error) => {
    // لو تسجيل الدخول فشل منحفظش الفشل، عشان التست اللي بعده يحاول تاني.
    cachedToken = undefined;
    throw error;
  });
  return cachedToken;
}
