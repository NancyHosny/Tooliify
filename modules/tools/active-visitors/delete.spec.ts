// تستات الحذف للأداة "زائر نشط": حذفها.

import { deleteTests } from '../tool-tests/delete-tests';
import { tools } from '../../../test-data/test-data';

deleteTests(tools['active-visitors']);
