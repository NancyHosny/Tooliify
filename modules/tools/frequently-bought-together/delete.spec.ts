// تستات الحذف للأداة "منتجات مقترحة معًا": حذفها.

import { deleteTests } from '../tool-tests/delete-tests';
import { tools } from '../../../test-data/test-data';

deleteTests(tools['frequently-bought-together']);
