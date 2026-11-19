// تستات الحذف للأداة "اشتري منتج": حذفها.

import { deleteTests } from '../tool-tests/delete-tests';
import { tools } from '../../../test-data/test-data';

deleteTests(tools['social-proof-purchase']);
