// تستات الحذف للأداة "عدد المشتريات": حذفها.

import { deleteTests } from '../tool-tests/delete-tests';
import { tools } from '../../../test-data/test-data';

deleteTests(tools['purchase-counter']);
