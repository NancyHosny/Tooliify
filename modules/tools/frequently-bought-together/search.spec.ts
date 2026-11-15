// تستات البحث للأداة "منتجات مقترحة معًا": إيجادها بالبحث في الكتالوج.
// حالات التست مكتوبة مرة واحدة في ../tool-tests/search-tests.ts، وهنا بنشغّلها ببيانات الأداة دي بس.

// نستورد دالة التستات المشتركة.
import { searchTests } from '../tool-tests/search-tests';
// نستورد بيانات الأدوات من ملف test-data الوحيد.
import { tools } from '../../../test-data/test-data';

// نشغّل التستات على الأداة دي (بنختارها من قايمة الأدوات بالـ slug بتاعها).
searchTests(tools['frequently-bought-together']);
