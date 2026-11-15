// نستورد test (بنسميه "setup" هنا عشان غرضه يبقى واضح) و expect.
import { test as setup, expect } from '@playwright/test';
// نستورد الـ Page Object بتاع صفحة تسجيل الدخول.
import { LoginPage } from '../pages/LoginPage';
// نستورد بيانات التاجر الصحيحة (من ملف .env).
import { validMerchant } from '../../../test-data/test-data';

// الملف اللي بتتحفظ فيه جلسة المتصفح بعد تسجيل الدخول (cookies + local storage).
export const MERCHANT_SESSION_FILE = '.auth/merchant.json';

// بنسجّل دخول مرة واحدة ونحفظ الجلسة، عشان باقي الموديولات متكررش خطوات تسجيل الدخول.
setup('authenticate as active merchant', async ({ page }) => {
  // نعمل الـ Page Object.
  const loginPage = new LoginPage(page);
  // نفتح صفحة تسجيل الدخول.
  await loginPage.open();
  // نسجّل دخول بالحساب الصحيح.
  await loginPage.login(validMerchant.email, validMerchant.password);
  // نستنى لحد ما نوصل للوحة التحكم (يعني خرجنا من صفحة /auth).
  await expect(page).not.toHaveURL(/\/auth/);
  // نحفظ الـ cookies والـ local storage في ملف الجلسة.
  await page.context().storageState({ path: MERCHANT_SESSION_FILE });
});
