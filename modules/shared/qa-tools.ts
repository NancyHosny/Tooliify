import { MyToolsClient } from '../tools/clients/MyToolsClient';
import { qaPrefix } from '../../test-data/test-data';

// دوال مشتركة لأدوات QA بالـ API. أكتر من موديول (الجدولة، المتجر، الإحصائيات، أدواتي) بيستخدموها،
// فكتبناها مرة واحدة هنا بدل ما كل موديول يكتب نسخته.

// بنضيف أداة بالـ API ونتأكد إنها اتضافت، وبنرجّع الـ id بتاعها. لو السيرفر رفض بنرمي خطأ فيه الرد.
export async function addToolOrFail(myTools: MyToolsClient, toolId: number, body: unknown) {
  // نبعت طلب الإضافة.
  const response = await myTools.addTool(toolId, body);
  // لو الرد مش 200 يبقى الإضافة فشلت، فنوقف التست برسالة واضحة.
  if (response.status() !== 200) throw new Error(`Could not add the QA tool: ${response.status()} ${await response.text()}`);
  // نقرا الـ id من الرد ونرجّعه.
  return (await response.json()).data.id as number;
}

// بنحذف كل أداة اسمها بيبدأ ببادئة QA (الأدوات الحقيقية مبتتلمسش أبدًا).
export async function deleteQaTools(myTools: MyToolsClient) {
  // نقرا قايمة "أدواتي": كل أداة ليها مجموعة نسخ (instances).
  const groups = (await (await myTools.listMyTools()).json()).data.tools as { instances: { id: number; display_name: string }[] }[];
  // نلف على كل نسخة في كل مجموعة.
  for (const group of groups) {
    for (const instance of group.instances) {
      if (instance.display_name.startsWith(qaPrefix)) await myTools.deleteTool(instance.id);
    }
  }
}
