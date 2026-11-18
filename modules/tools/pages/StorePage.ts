// نستورد أنواع Playwright.
import { Page } from '@playwright/test';
// نستورد عنوان المتجر.
import { store } from '../../../test-data/test-data';

// Page Object للمتجر الحقيقي بتاع الحساب (متجر تجريبي على سلة). صفحة عامة من غير تسجيل دخول.
export class StorePage {
  // التاب (الصفحة) بتاعة المتصفح.
  readonly page: Page;

  // بنبني الـ Page Object.
  constructor(page: Page) {
    this.page = page;
  }

  // نفتح الصفحة الرئيسية للمتجر.
  async open() {
    await this.page.goto(store.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  }

  // هل النص ده موجود في الصفحة؟ (بيشمل اللي سكريبت Tooliify رسمه).
  async contains(text: string): Promise<boolean> {
    return (await this.page.content()).includes(text);
  }

  // نعمل reload للمتجر لحد ما النص يظهر في الصفحة. بيرجّع true لو لقيناه.
  async waitUntilContains(text: string, seconds: number): Promise<boolean> {
    const end = Date.now() + seconds * 1000;
    while (Date.now() < end) {
      // نستنى كام ثانية عشان سكريبت Tooliify يرسم الأدوات.
      await this.page.waitForTimeout(5000);
      if (await this.contains(text)) return true;
      await this.page.reload({ waitUntil: 'domcontentloaded' });
    }
    return false;
  }

  // نعمل reload للمتجر لحد ما النص يختفي من الصفحة. بيرجّع true لو اختفى.
  async waitUntilGone(text: string, seconds: number): Promise<boolean> {
    const end = Date.now() + seconds * 1000;
    while (Date.now() < end) {
      // نستنى كام ثانية، وبعدين نعمل reload ونشوف النص لسه موجود ولا لأ.
      await this.page.waitForTimeout(5000);
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.page.waitForTimeout(3000);
      if (!(await this.contains(text))) return true;
    }
    return false;
  }
}
