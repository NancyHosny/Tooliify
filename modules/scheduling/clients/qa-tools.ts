import { APIRequestContext } from '@playwright/test';
import { getMerchantToken } from '../../shared/merchant-token';
import { addToolOrFail } from '../../shared/qa-tools';
import { MyToolsClient } from '../../tools/clients/MyToolsClient';
import { SchedulingClient } from './SchedulingClient';
import { toolToAdd, addToolBody, newQaToolName } from '../../../test-data/test-data';

// صفحة الجدولة بتعرض الأدوات اللي بتدعم الجدولة بس (أدواتك الحقيقية مش بتظهر فيها)،
// فكل تست بيضيف أداة QA بالـ API ويحذفها بعد كده (الحذف في shared/qa-tools.ts). الدوال دي بتعمل ده بسرعة من غير ما نفتح المتصفح.

// بنجيب توكن التاجر (مرة واحدة لكل الـ worker) وبنرجّع عميل أدواتي وعميل الجدولة بنفس التوكن.
export async function createClients(request: APIRequestContext) {
  const token = await getMerchantToken(request);
  return { myTools: new MyToolsClient(request, token), scheduling: new SchedulingClient(request, token) };
}

// بنضيف أداة QA (أداة الكوكيز) بالـ API ونرجّع الـ id بتاعها واسمها.
export async function addQaTool(myTools: MyToolsClient) {
  const name = newQaToolName('scheduling');
  const id = await addToolOrFail(myTools, toolToAdd.id, addToolBody(name));
  return { id, name };
}
