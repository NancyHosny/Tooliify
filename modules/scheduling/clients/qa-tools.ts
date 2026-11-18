// نستورد نوع Playwright الخاص بطلبات HTTP.
import { APIRequestContext } from '@playwright/test';
// نستورد توكن التاجر (بيتجاب مرة واحدة) وعميل أدواتي (عشان نضيف ونحذف أدوات QA).
import { getMerchantToken } from '../../shared/merchant-token';
import { MyToolsClient } from '../../tools/clients/MyToolsClient';
import { SchedulingClient } from './SchedulingClient';
// نستورد بيانات التست.
import { toolToAdd, addToolBody, newQaToolName, qaPrefix } from '../../../test-data/test-data';

// صفحة الجدولة بتعرض الأدوات اللي بتدعم الجدولة بس (أدواتك الحقيقية مش بتظهر فيها)،
// فكل تست بيضيف أداة QA بالـ API ويحذفها بعد كده. الدوال دي بتعمل ده بسرعة من غير ما نفتح المتصفح.

// بنجيب توكن التاجر (مرة واحدة لكل الـ worker) وبنرجّع عميل أدواتي وعميل الجدولة بنفس التوكن.
export async function createClients(request: APIRequestContext) {
  const token = await getMerchantToken(request);
  return { myTools: new MyToolsClient(request, token), scheduling: new SchedulingClient(request, token) };
}

// بنضيف أداة QA (أداة الكوكيز) بالـ API ونرجّع الـ id بتاعها واسمها.
export async function addQaTool(myTools: MyToolsClient) {
  const name = newQaToolName('scheduling');
  const response = await myTools.addTool(toolToAdd.id, addToolBody(name));
  if (response.status() !== 200) throw new Error(`Could not add the QA tool: ${response.status()} ${await response.text()}`);
  const id = (await response.json()).data.id as number;
  return { id, name };
}

// بنحذف كل أداة اسمها بيبدأ ببادئة QA (الأدوات الحقيقية مبتتلمسش).
export async function deleteQaTools(myTools: MyToolsClient) {
  const groups = (await (await myTools.listMyTools()).json()).data.tools as { instances: { id: number; display_name: string }[] }[];
  for (const group of groups) {
    for (const instance of group.instances) {
      if (instance.display_name.startsWith(qaPrefix)) await myTools.deleteTool(instance.id);
    }
  }
}
