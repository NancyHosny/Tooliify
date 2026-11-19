// تستات الحذف للأداة "الكوكيز": حذفها.

import { deleteTests } from '../tool-tests/delete-tests';
import { tools } from '../../../test-data/test-data';

deleteTests(tools['cookies-consent']);
