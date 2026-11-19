import { Page } from '@playwright/test';
import { store } from '../../../test-data/test-data';

// Page Object للمتجر الحقيقي بتاع الحساب (متجر تجريبي على سلة). صفحة عامة من غير تسجيل دخول.
export class StorePage {
  readonly page: Page;
  // آخر نسخة من سكريبت Tooliify (ملف newtoolify_….js) المتصفح حمّلها وهو بيفتح المتجر.
  private scriptText = '';

  constructor(page: Page) {
    this.page = page;
    // كل مرة المتجر بيحمّل سكريبت Tooliify بنحفظ محتواه، عشان نعرف الأدوات اللي المتجر عارفها حتى لو مرسومة بعد حركة الزائر.
    page.on('response', async (response) => {
      if (response.url().includes('newtoolify_')) this.scriptText = await response.text().catch(() => this.scriptText);
    });
  }

  // نفتح الصفحة الرئيسية للمتجر.
  async open() {
    await this.page.goto(store.url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  }

  // هل النص ده موجود في المتجر؟ بندوّر في الصفحة اللي اترسمت وفي سكريبت Tooliify اللي المتصفح حمّله.
  async contains(text: string): Promise<boolean> {
    return this.scriptText.includes(text) || (await this.page.content()).includes(text);
  }

  // نعمل reload للمتجر لحد ما النص يظهر. بيرجّع true لو لقيناه.
  async waitUntilContains(text: string, seconds: number): Promise<boolean> {
    const end = Date.now() + seconds * 1000;
    while (Date.now() < end) {
      // نستنى كام ثانية عشان سكريبت Tooliify يتحمّل ويرسم الأدوات.
      await this.page.waitForTimeout(5000);
      if (await this.contains(text)) return true;
      await this.page.reload({ waitUntil: 'domcontentloaded' });
    }
    return false;
  }

  // نعمل reload للمتجر لحد ما النص يختفي. بيرجّع true لو اختفى.
  async waitUntilGone(text: string, seconds: number): Promise<boolean> {
    const end = Date.now() + seconds * 1000;
    while (Date.now() < end) {
      await this.page.waitForTimeout(5000);
      await this.page.reload({ waitUntil: 'domcontentloaded' });
      await this.page.waitForTimeout(3000);
      if (!(await this.contains(text))) return true;
    }
    return false;
  }
}
