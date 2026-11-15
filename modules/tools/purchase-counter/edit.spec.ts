// تستات التعديل للأداة "عدد المشتريات": تعديلها وتشغيلها وإيقافها.
// حالات التست مكتوبة مرة واحدة في ../tool-tests/edit-tests.ts، وهنا بنشغّلها ببيانات الأداة دي بس.

// نستورد دالة التستات المشتركة.
import { editTests } from '../tool-tests/edit-tests';
// نستورد بيانات الأدوات من ملف test-data الوحيد.
import { tools } from '../../../test-data/test-data';

// نشغّل التستات على الأداة دي (بنختارها من قايمة الأدوات بالـ slug بتاعها).
editTests(tools['purchase-counter']);
