// تستات الحذف للأداة "سيلز بلس": حذفها.
// حالات التست مكتوبة مرة واحدة في ../tool-tests/delete-tests.ts، وهنا بنشغّلها ببيانات الأداة دي بس.

// نستورد دالة التستات المشتركة.
import { deleteTests } from '../tool-tests/delete-tests';
// نستورد بيانات الأدوات من ملف test-data الوحيد.
import { tools } from '../../../test-data/test-data';

// نشغّل التستات على الأداة دي (بنختارها من قايمة الأدوات بالـ slug بتاعها).
deleteTests(tools['sales-plus']);
