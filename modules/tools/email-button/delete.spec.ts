// تستات الحذف للأداة "البريد الإلكتروني": حذفها.

import { deleteTests } from '../tool-tests/delete-tests';
import { tools } from '../../../test-data/test-data';

deleteTests(tools['email-button']);
