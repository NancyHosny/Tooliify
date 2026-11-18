// نستورد نوع Playwright الخاص بطلبات HTTP.
import { APIRequestContext } from '@playwright/test';
// نستورد توكن التاجر (بيتجاب مرة واحدة)، وعميل أدواتي، وعميل الجدولة، وعميل الإحصائيات.
import { getMerchantToken } from '../../shared/merchant-token';
import { MyToolsClient } from '../../tools/clients/MyToolsClient';
import { SchedulingClient } from '../../scheduling/clients/SchedulingClient';
import { StatisticsClient } from '../../dashboard/clients/StatisticsClient';
import { deleteQaTools } from '../../scheduling/clients/qa-tools';
import { StorefrontClient } from './StorefrontClient';
// نستورد بيانات التست.
import { addToolBody, reviewsToolBody, toolToAdd, reviewsTool, newQaToolName } from '../../../test-data/test-data';

// تستات المتجر بتحتاج أدوات QA بحالات مختلفة (مفعّلة، موقوفة، مجدولة). الدوال دي بتعملها بالـ API بسرعة.

// بنجيب التوكن (مرة واحدة لكل الـ worker) وبنرجّع كل العملاء اللي التستات محتاجاها.
export async function createStoreClients(request: APIRequestContext) {
  const token = await getMerchantToken(request);
  return {
    myTools: new MyToolsClient(request, token),
    scheduling: new SchedulingClient(request, token),
    statistics: new StatisticsClient(request, token),
    storefront: new StorefrontClient(request),
  };
}

// بنضيف أداة الكوكيز (QA) وبنكتب في عنوانها قيمة مميزة، عشان نلاقيها في ملف المتجر. بنرجّع الـ id والقيمة.
export async function addMarkedCookiesTool(myTools: MyToolsClient) {
  const marker = `QAMARK${Date.now()}`;
  const body = addToolBody(newQaToolName('storefront'));
  body.config.title = marker;
  const response = await myTools.addTool(toolToAdd.id, body);
  if (response.status() !== 200) throw new Error(`Could not add the QA cookies tool: ${response.status()} ${await response.text()}`);
  return { id: (await response.json()).data.id as number, marker };
}

// بنضيف أداة آراء العملاء (QA) ونكتب في اسم أيقونتها قيمة مميزة. بنرجّع الـ id والقيمة.
export async function addQaReviewsTool(myTools: MyToolsClient) {
  const marker = `QAICON${Date.now()}`;
  const body = reviewsToolBody(newQaToolName(reviewsTool.slug));
  body.config.icon_title = marker;
  const response = await myTools.addTool(reviewsTool.id, body);
  if (response.status() !== 200) throw new Error(`Could not add the QA reviews tool: ${response.status()} ${await response.text()}`);
  return { id: (await response.json()).data.id as number, marker };
}

// بنحذف كل أدوات QA.
export { deleteQaTools };
