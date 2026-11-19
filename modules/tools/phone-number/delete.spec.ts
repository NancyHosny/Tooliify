// تستات الحذف للأداة "رقم الهاتف": حذفها.

import { deleteTests } from '../tool-tests/delete-tests';
import { tools } from '../../../test-data/test-data';

deleteTests(tools['phone-number']);
