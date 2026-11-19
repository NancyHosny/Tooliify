// تستات الحذف للأداة "منتجات مشابهة": حذفها.

import { deleteTests } from '../tool-tests/delete-tests';
import { tools } from '../../../test-data/test-data';

deleteTests(tools['similar-products']);
