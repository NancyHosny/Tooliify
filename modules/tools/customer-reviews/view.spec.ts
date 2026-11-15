// تستات العرض للأداة "آراء العملاء": كارتها في الكتالوج ونافذة المعاينة وصفحة الـ builder.
// حالات التست مكتوبة مرة واحدة في ../tool-tests/view-tests.ts، وهنا بنشغّلها ببيانات الأداة دي بس.

// نستورد دالة التستات المشتركة.
import { viewTests } from '../tool-tests/view-tests';
// نستورد بيانات الأدوات من ملف test-data الوحيد.
import { tools } from '../../../test-data/test-data';

// نشغّل التستات على الأداة دي (بنختارها من قايمة الأدوات بالـ slug بتاعها).
viewTests(tools['customer-reviews']);
