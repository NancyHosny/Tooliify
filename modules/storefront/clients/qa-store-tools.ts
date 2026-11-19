import { APIRequestContext } from '@playwright/test';
import { getMerchantToken } from '../../shared/merchant-token';
import { addToolOrFail } from '../../shared/qa-tools';
import { MyToolsClient } from '../../tools/clients/MyToolsClient';
import { SchedulingClient } from '../../scheduling/clients/SchedulingClient';
import { StatisticsClient } from '../../dashboard/clients/StatisticsClient';
import { StorefrontClient } from './StorefrontClient';
import { addToolBody, reviewsToolBody, toolToAdd, reviewsTool, newQaToolName } from '../../../test-data/test-data';

// تستات المتجر بتحتاج أدوات QA بحالات مختلفة (مفعّلة، موقوفة، مجدولة). الدوال دي بتعملها بالـ API بسرعة.
// (حذف أدوات QA في shared/qa-tools.ts).

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
  return { id: await addToolOrFail(myTools, toolToAdd.id, body), marker };
}

// بنضيف أداة آراء العملاء (QA) ونكتب في اسم أيقونتها قيمة مميزة. بنرجّع الـ id والقيمة.
export async function addQaReviewsTool(myTools: MyToolsClient) {
  const marker = `QAICON${Date.now()}`;
  const body = reviewsToolBody(newQaToolName(reviewsTool.slug));
  body.config.icon_title = marker;
  return { id: await addToolOrFail(myTools, reviewsTool.id, body), marker };
}
