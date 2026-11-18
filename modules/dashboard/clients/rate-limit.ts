// نستورد الحد الأقصى للطلبات في الدقيقة من ملف البيانات.
import { statisticsApi } from '../../../test-data/test-data';

// الـ API بيسمح بـ 10 طلبات بس في الدقيقة لـ endpoints الإحصائيات (بعدها بيرد 429).
// لوحة التحكم نفسها بتنده الإحصائيات مرة في كل فتح، فتستات الـ UI والـ API بتتشارك نفس الحد.
// الدالتين دول بيخلّوا كل التستات تستنى لما يبقى في مكان فاضي، بدل ما تفشل بسبب الحد.

// أوقات آخر الطلبات (بالمللي ثانية). الملف ده بيتحمّل مرة واحدة لكل worker، فالقايمة مشتركة بين كل التستات.
const calls: number[] = [];

// دالة استنى بسيطة.
export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// بنستنى لحد ما يبقى عدد الطلبات في آخر دقيقة أقل من الحد، وبعدين نسجّل الطلب الجديد.
export async function waitForStatisticsSlot() {
  for (;;) {
    // نشيل الطلبات الأقدم من 62 ثانية (دقيقة + هامش أمان).
    while (calls.length > 0 && Date.now() - calls[0] > 62_000) calls.shift();
    // لو في مكان فاضي نسجّل الطلب ونكمّل.
    if (calls.length < statisticsApi.maxCallsPerMinute) break;
    // غير كده نستنى ثانية ونحاول تاني.
    await sleep(1000);
  }
  calls.push(Date.now());
}
