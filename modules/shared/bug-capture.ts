// الملف ده هو "التست" بتاعنا اللي بيلتقط الأخطاء أوتوماتيك.
// نستورد test و expect بتوع Playwright، ومعاهم أدوات Node اللي بتكتب الملفات وتحدد المسارات.
import { test as base, expect, Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

// الفولدر اللي بتتحفظ فيه سكرينشوتات التستات الفاشلة. تقدري تغيّريه بالمتغير BUGS_DIR في ملف .env.
const BUGS_DIR = process.env.BUGS_DIR ?? path.join(os.homedir(), 'Desktop', 'bugs');

// طلبات بتاعة خدمات خارجية مش مهمة لينا (تحليلات، شات، خطوط...). بنتجاهلها عشان متزحمش التقرير.
const IGNORED_URLS = /google|facebook|clarity|hotjar|analytics|gtag|doubleclick|sentry|wa\.me/i;

// طلب شبكة واحد (API call) بعد ما اتسجّل.
type Call = {
  method: string;
  url: string;
  status: number;
  // الوقت اللي الطلب خدّه بالمللي ثانية.
  ms: number;
  // محتوى الطلب اللي اتبعت (payload)، ونوعه، وحجمه بالبايت.
  requestBody: string;
  requestType: string;
  requestSize: number;
  responseBody: string;
};

// بنخفي الأسرار (الباسوردات والتوكنز) قبل ما نكتب أي حاجة على الجهاز.
function maskSecrets(text: string): string {
  // بنجرّب نقرا النص كـ JSON عشان نقدر نخفي الأسرار حسب اسم الحقل.
  try {
    // بنمشي على كل حقول الـ JSON، وأي حقل اسمه شبه (password / token / secret...) بنخفي قيمته.
    const walk = (value: any): any => {
      if (Array.isArray(value)) return value.map(walk);
      if (value && typeof value === 'object') {
        const copy: any = {};
        for (const key of Object.keys(value)) {
          copy[key] = /pass|token|secret|authorization/i.test(key) ? '***hidden***' : walk(value[key]);
        }
        return copy;
      }
      return value;
    };
    // بنرجّع الـ JSON بعد إخفاء الأسرار، منسّق وسهل القراءة.
    return JSON.stringify(walk(JSON.parse(text)), null, 2);
  } catch {
    // لو النص مش JSON (زي form body: "email=a&password=b") بنخفي الأسرار بالـ regex ونقصّ الطول.
    return hideSecretsInText(text).slice(0, 3000);
  }
}

// بنخفي الأسرار جوه النص العادي: أزواج الـ form (password=...) وأزواج شبه الـ JSON ("token":"...").
function hideSecretsInText(text: string): string {
  return text
    .replace(/((?:pass|token|csrf|secret)[a-z_]*)=([^&\s]*)/gi, '$1=***hidden***')
    .replace(/"((?:pass|token|csrf|secret)[a-z_]*)"\s*:\s*"[^"]*"/gi, '"$1":"***hidden***"');
}

// بنقترح إذا كانت المشكلة من الـ Front-end ولا الـ Back-end. ده مجرد اقتراح لازم يتأكد منه يدويًا.
function classify(calls: Call[], pageErrors: string[]): { side: string; reason: string } {
  // لو السيرفر رجّع خطأ 5xx يبقى المشكلة في الـ Back-end.
  const serverError = calls.find((c) => c.status >= 500);
  if (serverError) return { side: 'Back-end', reason: `${serverError.method} ${serverError.url} returned ${serverError.status}` };
  // لو السيرفر رد بخطأ 4xx يبقى الرسالة اللي ظهرت في الواجهة جاية من الـ API (غالبًا Back-end).
  const failedCall = calls.find((c) => c.status >= 400);
  if (failedCall) return { side: 'Back-end (probable)', reason: `${failedCall.method} ${failedCall.url} returned ${failedCall.status}; the message shown in the UI comes from this response.` };
  // لو في خطأ JavaScript في الصفحة نفسها يبقى المشكلة في الـ Front-end.
  if (pageErrors.length) return { side: 'Front-end', reason: `JavaScript error in the page: ${pageErrors[0]}` };
  // لو مفيش أي طلب اتبعت بعد حركة المستخدم (غير طلبات التحميل GET) يبقى السلوك من المتصفح/الواجهة بس (فاليديشن أو حالة زرار).
  if (!calls.some((c) => c.method !== 'GET')) return { side: 'Front-end', reason: 'No request was submitted to the server – the behaviour comes from the browser/UI only (validation or button state).' };
  // كل الطلبات نجحت (2xx) ومع كده الواجهة غلط، يبقى الواجهة غالبًا بتعرض أو بتتعامل مع البيانات غلط.
  return { side: 'Front-end (probable)', reason: 'All API calls succeeded, so the UI is probably showing or handling the data wrongly.' };
}

// بنزوّد مسافات في أول كل سطر من النص (بنستخدمها عشان ترتيب الطباعة في الترمنال).
function indent(text: string, spaces: number): string {
  return text.split('\n').map((line) => ' '.repeat(spaces) + line).join('\n');
}

// بنقصّ النص الطويل ونحط "…" في آخره.
function cut(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + ' …' : text;
}

// اسم كود الـ HTTP status. HTTP/2 مبيبعتش الاسم، فعملنا قايمة قصيرة بأشهر الأكواد.
function statusName(status: number): string {
  const names: Record<number, string> = {
    200: 'OK', 201: 'Created', 202: 'Accepted', 204: 'No Content', 301: 'Moved Permanently', 302: 'Found', 304: 'Not Modified',
    400: 'Bad Request', 401: 'Unauthorized', 403: 'Forbidden', 404: 'Not Found', 405: 'Method Not Allowed', 409: 'Conflict',
    422: 'Unprocessable Content', 429: 'Too Many Requests', 500: 'Internal Server Error', 502: 'Bad Gateway', 503: 'Service Unavailable',
  };
  return names[status] ?? '';
}

// بنختار الطلب اللي هنعرضه في التقرير بالترتيب ده:
// آخر طلب فاشل، وإلا آخر طلب اتبعت (غير GET)، وإلا آخر طلب للـ API، وإلا آخر طلب أيًا كان.
function pickMainCall(calls: Call[]): Call | undefined {
  const reversed = [...calls].reverse();
  return (
    reversed.find((c) => c.status >= 400) ??
    reversed.find((c) => c.method !== 'GET') ??
    reversed.find((c) => c.url.includes('/api/v1/')) ??
    reversed[0]
  );
}

// قسم "Payload": الحاجات اللي الصفحة بعتتها للسيرفر.
function payloadText(call: Call): string {
  // مفيش body اتبعت (زي طلب GET).
  if (!call.requestSize) return '(no body – this call sends no data)';
  // رفع ملف أو form-data: بنعرض نوعه وحجمه بس.
  if (call.requestType.includes('multipart')) return `multipart/form-data · ${call.requestSize} bytes`;
  // form body بالشكل "a=1&b=2": بنعرض كل حقل في سطر، مع إخفاء الأسرار.
  if (call.requestType.includes('x-www-form-urlencoded')) {
    return hideSecretsInText(call.requestBody)
      .split('&')
      .map((pair) => decodeURIComponent(pair.replace(/\+/g, ' ')))
      .join('\n');
  }
  // JSON (أو أي نوع تاني): نص منسّق مع إخفاء الأسرار.
  return cut(maskSecrets(call.requestBody), 800);
}

// قسم "Preview": أهم حقول الرد، كل حقل في سطر (المفتاح: القيمة).
function previewText(call: Call): string {
  // نجرّب نقرا الرد كـ JSON.
  let json: any;
  try {
    json = JSON.parse(call.responseBody);
  } catch {
    // الرد مش JSON (مثلًا صفحة HTML).
    return call.responseBody ? `(not JSON · ${call.responseBody.length} characters)` : '(empty response)';
  }
  // لو الرد قايمة بنعرض عدد العناصر بس.
  if (Array.isArray(json)) return `[${json.length} items]`;
  // لو الرد مش object (نص أو رقم عادي) بنعرضه زي ما هو.
  if (!json || typeof json !== 'object') return String(json);
  // لو الرد object فاضي (من غير حقول).
  if (Object.keys(json).length === 0) return '{} (no fields)';
  // لو الرد object: بنعرض أول 6 حقول، كل حقل في سطر.
  return Object.keys(json)
    .slice(0, 6)
    .map((key) => {
      const value = json[key];
      // الأسرار بتتخفي، والـ objects والقوايم بتتلخّص (عددها بس)، والباقي بيتعرض كـ JSON.
      if (/pass|token|secret|authorization/i.test(key)) return `${key}: "***hidden***"`;
      if (Array.isArray(value)) return `${key}: [${value.length} items]`;
      if (value && typeof value === 'object') return `${key}: {${Object.keys(value).length} fields}`;
      return `${key}: ${cut(JSON.stringify(value), 70)}`;
    })
    .join('\n');
}

// قسم "Response": الرد كامل ومنسّق مع إخفاء الأسرار.
function responseText(call: Call): string {
  if (!call.responseBody) return '(empty response)';
  // صفحة HTML طويلة جدًا فمش هنعرضها، هنكتب عدد حروفها بس.
  if (call.responseBody.trim().startsWith('<')) return `(HTML page · ${call.responseBody.length} characters)`;
  return cut(maskSecrets(call.responseBody), 1200);
}

// سطر لكل طلب: ✅ لو اشتغل، ❌ لو فشل. في تست API نجح كل الطلبات عملت اللي التست متوقعه (حتى لو 401)، فكلها ✅.
function endpointLines(calls: Call[], testPassed: boolean): string {
  if (!calls.length) return '  (no API calls)';
  return calls
    .map((c, i) => `  ${i + 1}. ${testPassed || c.status < 400 ? '✅' : '❌'} ${c.method} ${c.status} ${c.url}`)
    .join('\n');
}

// نص قصير لتست API نجح: قايمة الـ endpoints اللي اتندهت بس.
function apiEndpointsSummary(calls: Call[]): string {
  return [`━━ ✅ API endpoints (${calls.length}) ━━`, endpointLines(calls, true)].join('\n');
}

// بنبني النص اللي بيتطبع في الترمنال بعد التست (الألوان بتتضاف من terminal-reporter.ts).
function terminalSummary(failed: boolean, calls: Call[], mainCall: Call | undefined, side: string, reason: string): string {
  const out: string[] = [];
  // سطر العنوان: أيقونة + نوع الطلب + الـ status + الاسم + الوقت، وبعده العنوان الكامل (URL).
  if (mainCall) {
    const icon = mainCall.status >= 400 ? '❌' : '✅';
    out.push(`━━ ${icon} ${mainCall.method} ${mainCall.status} ${statusName(mainCall.status)} • ${mainCall.ms} ms ━━`.replace('  •', ' •'));
    out.push(mainCall.url);
  } else {
    out.push('━━ ⚠ No API call was recorded during this test ━━');
  }
  // لو التست فشل بنقول إذا كانت المشكلة شكلها Front-end ولا Back-end.
  if (failed) out.push(`Side: ${side} – ${reason}`);
  // لو الصفحة مبعتتش أي طلب بعد حركة المستخدم، بننبّه إن الطلب المعروض تحت هو آخر طلب API في الصفحة (للمرجعية بس).
  if (failed && mainCall && mainCall.method === 'GET' && mainCall.status < 400) {
    out.push('Note: no request was sent by the action. The call below is the last API call of the page, shown for reference.');
  }
  // الأقسام التلاتة للطلب الرئيسي: Payload وPreview وResponse.
  if (mainCall) {
    out.push('▸ Payload', indent(payloadText(mainCall), 2));
    out.push('▸ Preview', indent(previewText(mainCall), 2));
    out.push('▸ Response', indent(responseText(mainCall), 2));
  }
  // كل طلبات التست (قسم Network).
  out.push('▸ Network');
  out.push(endpointLines(calls, !failed && calls.every((c) => c.status < 400)));
  return out.join('\n');
}

// بندوّر على فولدر التشغيل ده للموديول (أو بنعمله): <module>-V1, <module>-V2, ...
function runFolder(moduleName: string): string {
  // رقم التشغيل بيتعمل مرة واحدة (في global-setup.ts) وهو نفسه لكل تستات التشغيل.
  const mapFile = path.join(os.tmpdir(), `tooliify-bugs-run-${process.env.BUGS_RUN_ID ?? 'single'}.json`);
  // بنقرا الفولدرات اللي اتعملت فعلًا في التشغيل ده.
  let folders: Record<string, string> = {};
  try {
    folders = JSON.parse(fs.readFileSync(mapFile, 'utf-8'));
  } catch {
    // أول فشل في التشغيل ده: لسه مفيش حاجة محفوظة.
  }
  // أول فشل للموديول ده في التشغيل ده: بنعمل فولدر النسخة الجاية.
  if (!folders[moduleName]) {
    fs.mkdirSync(BUGS_DIR, { recursive: true });
    // بنبص على الفولدرات الموجودة للموديول ده (auth-V1, auth-V2, ...) ونآخد الرقم اللي بعد أكبر رقم.
    const used = fs
      .readdirSync(BUGS_DIR)
      .map((name) => name.match(new RegExp(`^${moduleName}-V(\\d+)$`)))
      .filter((match) => match !== null)
      .map((match) => Number(match![1]));
    const next = (used.length ? Math.max(...used) : 0) + 1;
    folders[moduleName] = `${moduleName}-V${next}`;
    fs.mkdirSync(path.join(BUGS_DIR, folders[moduleName]), { recursive: true });
    fs.writeFileSync(mapFile, JSON.stringify(folders));
  }
  // بنرجّع المسار الكامل للفولدر.
  return path.join(BUGS_DIR, folders[moduleName]);
}

// بنعمل اسم ملف آمن من عنوان التست.
function slug(text: string): string {
  return text.replace(/[^a-zA-Z0-9؀-ۿ]+/g, '-').replace(/^-|-$/g, '').slice(0, 110);
}

// بنخلّي النص آمن عشان نحطه جوه HTML.
function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// بنشيل أكواد الألوان من النص (رسايل أخطاء Playwright فيها ألوان).
function stripColors(text: string): string {
  return text.replace(/\u001b\[[0-9;]*m/g, '');
}

// بنستنى لحد ما الصفحة تهدى (الشبكة تخلص وأشكال التحميل الرمادية تختفي)، عشان السكرينشوت يبان فيه المشكلة الحقيقية مش شاشة تحميل.
async function waitUntilPageIsReady(page: Page) {
  try {
    // نستنى الشبكة تهدى (لحد 10 ثواني).
    await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
    // نستنى الأشكال الرمادية بتاعة التحميل تختفي (لحد 5 ثواني).
    await page.locator('.animate-pulse').first().waitFor({ state: 'hidden', timeout: 5_000 }).catch(() => {});
    // وقفة قصيرة عشان الرسايل (toast) والحركات تخلص ظهور.
    await page.waitForTimeout(1_000);
  } catch {
    // الصفحة اتقفلت خلاص، مفيش حاجة نستناها.
  }
}

// التفاصيل الكاملة لتست API فاشل (بتتكتب في details.txt): الخطأ، الجهة المقترحة، وكل طلب بالـ request والـ response.
function apiDetails(title: string, error: string, side: string, reason: string, calls: Call[]): string {
  const out: string[] = [];
  out.push('='.repeat(100), `TEST: ${title}`, '='.repeat(100));
  out.push(`ERROR:\n${error || '(no message)'}`);
  out.push(`SIDE: ${side} – ${reason}`);
  // كل طلبات التست بالترتيب.
  calls.forEach((call, i) => {
    out.push('', `--- Call ${i + 1}: ${call.method} ${call.status} ${statusName(call.status)} • ${call.ms} ms`);
    out.push(`URL: ${call.url}`);
    out.push(`PAYLOAD: ${call.requestSize ? maskSecrets(call.requestBody) : '(no body)'}`);
    // صفحة HTML بنلخّصها، والـ JSON بنعرضه كامل مع إخفاء الأسرار.
    const response = !call.responseBody ? '(empty)' : call.responseBody.trim().startsWith('<') ? `(HTML page · ${call.responseBody.length} characters)` : maskSecrets(call.responseBody);
    out.push(`RESPONSE: ${response}`);
  });
  out.push('', '');
  return out.join('\n');
}

// تستات الـ API مفيهاش صفحة نصوّرها، فبنرسم التقرير على صفحة فاضية ونصوّرها.
async function drawApiReport(page: Page, title: string, errorMessage: string, summary: string) {
  // صفحة غامقة بسيطة فيها اسم التست والخطأ ونفس النص اللي بيتطبع في الترمنال.
  const html = `<body style="margin:0;background:#111827;color:#e5e7eb;font:14px/1.6 Consolas,monospace;padding:24px;width:1100px">
    <h2 style="margin:0 0 12px;color:#fbbf24">${escapeHtml(title)}</h2>
    <pre style="white-space:pre-wrap;color:#fca5a5;margin:0 0 20px">${escapeHtml(errorMessage)}</pre>
    <pre style="white-space:pre-wrap;margin:0">${escapeHtml(summary)}</pre></body>`;
  await page.setContent(html);
}

// "test" بتاعنا: نفس تست Playwright بس مضاف عليه التقاط أوتوماتيك للأخطاء لكل تست UI و API.
export const test = base.extend<{ bugCapture: void; apiCalls: Call[] }>({
  // طلبات الـ API اللي اتعملت من fixture اسمه request خلال التست.
  apiCalls: async ({}, use) => {
    await use([]);
  },

  // بنغلّف الـ fixture اسمه request عشان كل طلب API يتسجّل (النوع، العنوان، الـ body، الـ status، الرد).
  request: async ({ request, apiCalls }, use) => {
    const wrapped = new Proxy(request, {
      get(target, prop) {
        const value = Reflect.get(target, prop, target);
        // بنسجّل طلبات HTTP بس (get/post/put/patch/delete/head/fetch)، وباقي الدوال بتشتغل عادي.
        if (typeof value !== 'function') return value;
        if (!['get', 'post', 'put', 'patch', 'delete', 'head', 'fetch'].includes(String(prop))) return value.bind(target);
        return async (...args: any[]) => {
          const started = Date.now();
          const response = await value.apply(target, args);
          // بنعرف إيه اللي اتبعت في الطلب.
          const options = (typeof args[0] === 'string' ? args[1] : args[0]) ?? {};
          let body = '';
          let type = '';
          if (options.data !== undefined && options.data !== null) {
            body = typeof options.data === 'string' ? options.data : JSON.stringify(options.data);
            type = 'application/json';
          } else if (options.form) {
            body = new URLSearchParams(options.form).toString();
            type = 'application/x-www-form-urlencoded';
          }
          let responseBody = '';
          try {
            responseBody = await response.text();
          } catch {
            responseBody = '(body not available)';
          }
          apiCalls.push({
            method: String(prop) === 'fetch' ? String(options.method ?? 'GET').toUpperCase() : String(prop).toUpperCase(),
            url: response.url(),
            status: response.status(),
            ms: Date.now() - started,
            requestBody: body,
            requestType: type,
            requestSize: Buffer.byteLength(body),
            responseBody,
          });
          return response;
        };
      },
    });
    await use(wrapped);
  },

  bugCapture: [
    async ({ page, apiCalls }, use, testInfo) => {
      // قوايم بتتملي أثناء ما التست شغّال.
      const calls: Call[] = [];
      const pending: Promise<void>[] = [];
      const pageErrors: string[] = [];

      // بنسجّل كل طلب API (fetch / XHR) مع الـ request والـ response بتوعه.
      page.on('response', (response) => {
        // بنبص على طلبات الـ API بس، مش الصور والسكريبتات.
        const request = response.request();
        if (!['fetch', 'xhr'].includes(request.resourceType())) return;
        if (IGNORED_URLS.test(request.url())) return;
        // بنتجاهل طلبات التحميل المسبق (_rsc) بتاعة Next.js لأنها مش طلبات API حقيقية.
        if (request.url().includes('_rsc=')) return;
        // بنقرا جسم الرد بعدين (ممكن الصفحة تتقفل قبل كده)، فبنحتفظ بالـ promise.
        pending.push(
          (async () => {
            let body = '';
            try {
              body = await response.text();
            } catch {
              body = '(body not available)';
            }
            calls.push({
              method: request.method(),
              url: request.url(),
              status: response.status(),
              ms: Math.max(0, Math.round(request.timing().responseEnd)),
              requestBody: request.postData() ?? '',
              requestType: request.headers()['content-type'] ?? '',
              requestSize: request.postDataBuffer()?.length ?? 0,
              responseBody: body,
            });
          })()
        );
      });
      // بنسجّل أخطاء JavaScript اللي بتحصل في الصفحة.
      page.on('pageerror', (error) => pageErrors.push(error.message));

      // هنا التست نفسه بيشتغل.
      await use();

      // التستات المتخطية مفيهاش حاجة نعرضها.
      if (testInfo.status === 'skipped') return;

      // نستنى لحد ما كل أجسام الردود تتقرا.
      await Promise.all(pending);

      // طلبات الـ API اللي اتعملت من fixture اسمه request بتتضاف للقايمة.
      calls.push(...apiCalls);

      // بنختار الطلب المعروض ونقرر إذا كانت المشكلة Front-end ولا Back-end.
      const mainCall = pickMainCall(calls);
      const { side, reason } = classify(calls, pageErrors);
      const failed = testInfo.status !== testInfo.expectedStatus;

      // تستات الـ API موجودة في modules/<module>/api/.
      const isApiTest = /modules[\\/][^\\/]+[\\/]api[\\/]/.test(testInfo.file);

      if (failed || (!isApiTest && calls.some((c) => c.status >= 400))) {
        // تست فشل (أو تست UI فيه خطأ API): بنعرض التفاصيل كاملة.
        await testInfo.attach('terminal-summary', {
          body: terminalSummary(failed, calls, mainCall, side, reason),
          contentType: 'text/plain',
        });
      } else if (isApiTest) {
        // تست API نجح: بنعرض قايمة الـ endpoints اللي اشتغلت بس.
        await testInfo.attach('terminal-summary', { body: apiEndpointsSummary(calls), contentType: 'text/plain' });
      }

      // الملفات (السكرينشوت والتقرير) بتتحفظ للتستات الفاشلة بس.
      if (!failed) return;

      // اسم الموديول بنطلعه من مسار ملف التست: modules/<module>/...
      const moduleName = testInfo.file.match(/modules[\\/]([^\\/]+)/)?.[1] ?? 'general';
      // تستات الـ API ليها فولدر لوحدها: api-<module> (api-auth-V1, api-profile-V1, ...)، وتستات الـ UI بتستخدم <module>-V1.
      // فولدر التشغيل ده للموديول ده.
      const folder = runFolder(isApiTest ? `api-${moduleName}` : moduleName);

      // تستات الـ API كمان بتكتب ملف نصي واحد (details.txt) فيه كل تفاصيل كل تست فاشل (الطلب والرد كاملين).
      if (isApiTest) {
        const detailsFile = path.join(folder, 'details.txt');
        fs.appendFileSync(detailsFile, apiDetails(testInfo.titlePath.slice(1).join(' › '), stripColors(testInfo.errors[0]?.message ?? ''), side, reason, calls));
      }
      // اسم الملف: رقم متسلسل (01, 02, ...) عشان السكرينشوتات تفضل مرتبة.
      const number = String(fs.readdirSync(folder).filter((f) => f.endsWith('.png')).length + 1).padStart(2, '0');
      // اسم الملف فيه اسم المجموعة واسم التست (مثلًا اسم الأداة) عشان نلاقيه بسهولة.
      const screenshotFile = path.join(folder, `${number}-${slug(testInfo.titlePath.slice(1).join(' '))}.png`);

      // بناخد سكرينشوت لحالة الفشل.
      try {
        // تست الـ API عمره ما فتح صفحة: بنرسم التقرير (الخطأ + الطلب + الرد) ونصوّره.
        if (page.url() === 'about:blank') {
          const summary = terminalSummary(failed, calls, mainCall, side, reason);
          const error = stripColors(testInfo.errors[0]?.message ?? 'The test failed.').slice(0, 1500);
          await drawApiReport(page, testInfo.titlePath.slice(1).join(' › '), error, summary);
        } else {
          // تست UI: نستنى لحد ما الصفحة تعرض حالتها الحقيقية وبعدين نصوّر.
          await waitUntilPageIsReady(page);
        }
        await page.screenshot({ path: screenshotFile, fullPage: true });
        // نبلّغ الـ reporter بمكان السكرينشوت (هو اللي بيطبع القايمة في آخر التشغيل).
        await testInfo.attach('saved-screenshot', { body: screenshotFile, contentType: 'text/plain' });
      } catch {
        // الصفحة اتقفلت خلاص، مينفعش نصوّر.
      }
    },
    { auto: true },
  ],
});

// بنعيد تصدير expect عشان التستات تستورد الاتنين (test و expect) من الملف ده.
export { expect };
