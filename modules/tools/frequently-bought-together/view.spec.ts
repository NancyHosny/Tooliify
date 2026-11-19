// تستات العرض للأداة "منتجات مقترحة معًا": كارتها في الكتالوج ونافذة المعاينة وصفحة الـ builder.

import { viewTests } from '../tool-tests/view-tests';
import { tools } from '../../../test-data/test-data';

viewTests(tools['frequently-bought-together']);
