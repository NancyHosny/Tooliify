// تستات الإضافة للأداة "مغلق للصيانة": إضافتها لصفحة "أدواتي".
// حالات التست مكتوبة مرة واحدة في ../tool-tests/add-tests.ts، وهنا بنشغّلها ببيانات الأداة دي بس.

// نستورد دالة التستات المشتركة.
import { addTests } from '../tool-tests/add-tests';
// نستورد بيانات الأدوات من ملف test-data الوحيد.
import { tools } from '../../../test-data/test-data';

// نشغّل التستات على الأداة دي (بنختارها من قايمة الأدوات بالـ slug بتاعها).
addTests(tools['maintenance-mode']);
