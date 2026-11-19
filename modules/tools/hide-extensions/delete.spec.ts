// تستات الحذف للأداة "إخفاء من الإضافات": حذفها.

import { deleteTests } from '../tool-tests/delete-tests';
import { tools } from '../../../test-data/test-data';

deleteTests(tools['hide-extensions']);
