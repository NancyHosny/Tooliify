// تستات الحذف للأداة "شارات الثقة": حذفها.

import { deleteTests } from '../tool-tests/delete-tests';
import { tools } from '../../../test-data/test-data';

deleteTests(tools['trust-badges']);
