// نستورد عنوان ملف الاستور (الملف العام اللي Tooliify بتنشره للمتجر).
import { store } from '../../../test-data/test-data';

// بيقرا الملف العام اللي المتجر بيحمّله عشان يرسم الأدوات المفعّلة.
// Tooliify بتعيد كتابة الملف ده في كل مرة أداة تتضاف أو تتعدل أو تتحذف.
export class StoreClient {
  // بننزّل الملف. الرقم المتغير في آخر العنوان (?t=...) بيمنع أي كاش من إنه يرجّع نسخة قديمة.
  async scriptText(): Promise<string> {
    const response = await fetch(`${store.scriptUrl}?t=${Date.now()}`);
    return response.text();
  }

  // هل النص ده موجود جوه الملف؟ بنكتب قيمة مميزة في الـ builder، ولو لقيناها هنا يبقى الأداة وصلت للاستور فعلًا.
  async scriptHas(text: string): Promise<boolean> {
    return (await this.scriptText()).includes(text);
  }
}
