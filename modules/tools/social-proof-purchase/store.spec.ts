// تستات الاستور للأداة "اشتري منتج": هل بتوصل فعلًا لمتجر التاجر (إضافة وتعديل وحذف).
// حالات التست مكتوبة مرة واحدة في ../tool-tests/store-tests.ts، وهنا بنشغّلها ببيانات الأداة دي بس.

// نستورد دالة التستات المشتركة.
import { storeTests } from '../tool-tests/store-tests';
// نستورد بيانات الأدوات من ملف test-data الوحيد.
import { tools } from '../../../test-data/test-data';

// نشغّل التستات على الأداة دي (بنختارها من قايمة الأدوات بالـ slug بتاعها).
storeTests(tools['social-proof-purchase']);
