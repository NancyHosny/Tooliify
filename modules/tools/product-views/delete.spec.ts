// تستات الحذف للأداة "عدد المشاهدات": حذفها.

import { deleteTests } from '../tool-tests/delete-tests';
import { tools } from '../../../test-data/test-data';

deleteTests(tools['product-views']);
