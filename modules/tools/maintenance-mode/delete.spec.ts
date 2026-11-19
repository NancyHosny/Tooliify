// تستات الحذف للأداة "مغلق للصيانة": حذفها.

import { deleteTests } from '../tool-tests/delete-tests';
import { tools } from '../../../test-data/test-data';

deleteTests(tools['maintenance-mode']);
