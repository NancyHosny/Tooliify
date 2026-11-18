// نستورد نوع Playwright الخاص بطلبات HTTP.
import { APIRequestContext } from '@playwright/test';
// نستورد انتظار الحد الأقصى للطلبات.
import { waitForStatisticsSlot, sleep } from './rate-limit';

// مسارات الـ endpoints من ملف Toolifiy.JSON (تاج "Tool Statistics").
const PATHS = {
  dashboard: '/api/v1/merchant/statistics',
  tool: (id: number | string) => `/api/v1/merchant/tools/my/${id}/statistics`,
  track: '/api/v1/tracking/events',
};

// عميل API للإحصائيات: دالة بسيطة لكل endpoint.
export class StatisticsClient {
  // كائن الطلبات (الـ baseURL هو API_URL).
  readonly request: APIRequestContext;
  // الـ JWT بتاع التاجر اللي عامل تسجيل دخول.
  readonly token: string;

  // نحفظ كائن الطلبات والتوكن.
  constructor(request: APIRequestContext, token: string) {
    this.request = request;
    this.token = token;
  }

  // هيدر Authorization وهيدر الرسايل العربي بيتبعتوا مع كل طلب.
  private headers(language = 'ar') {
    return { Authorization: `Bearer ${this.token}`, 'Accept-Language': language };
  }

  // طلب GET بيستنى مكانه في حد الـ 10 طلبات في الدقيقة، ولو رجع 429 بيستنى ويحاول تاني.
  private async get(url: string, params: Record<string, string>, language: string) {
    // نبعت الطلب أول مرة، ولو رجع 429 نستنى دقيقة ونحاول (لحد 3 مرات تانية).
    await waitForStatisticsSlot();
    let response = await this.request.get(url, { params, headers: this.headers(language) });
    for (let retry = 0; retry < 3 && response.status() === 429; retry++) {
      // الحد اتعدّى (مثلًا لأن worker جديد بدأ): نستنى دقيقة ونحاول تاني.
      await sleep(60_000);
      await waitForStatisticsSlot();
      response = await this.request.get(url, { params, headers: this.headers(language) });
    }
    return response;
  }

  // GET /merchant/statistics – لوحة التحكم (من غير تواريخ = الأسبوع الحالي). "params" = { from, to } اختياري.
  async dashboard(params: Record<string, string> = {}, language = 'ar') {
    return this.get(PATHS.dashboard, params, language);
  }

  // GET /merchant/tools/my/{merchantTool}/statistics – إحصائيات أداة واحدة.
  async tool(id: number | string, params: Record<string, string> = {}, language = 'ar') {
    return this.get(PATHS.tool(id), params, language);
  }

  // إحصائيات أداة واحدة من غير ما نقع في المخزّن المؤقت: السيرفر بيحفظ الرد لكل فترة تواريخ لفترة (ممكن تفضل أكتر من دقيقتين على 0)،
  // فكل محاولة (attempt) بنسأل بفترة مختلفة تنتهي النهارده: من النهارده لحد النهارده، وبعدين من امبارح للنهارده، وهكذا.
  async toolFresh(id: number | string, attempt: number) {
    const day = (back: number) => new Date(Date.now() - back * 86_400_000).toISOString().slice(0, 10);
    return this.tool(id, { from: day(attempt), to: day(0) });
  }

  // POST /tracking/events – تسجيل نقرات ومرور (المتجر بيبعتها، ومحتاجش توكن).
  async track(body: unknown) {
    return this.request.post(PATHS.track, { data: body });
  }
}
