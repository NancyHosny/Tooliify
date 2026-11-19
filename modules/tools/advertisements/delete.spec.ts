// تستات الحذف للأداة "إعلانات": حذفها.

import { deleteTests } from '../tool-tests/delete-tests';
import { tools } from '../../../test-data/test-data';

deleteTests(tools['advertisements']);
