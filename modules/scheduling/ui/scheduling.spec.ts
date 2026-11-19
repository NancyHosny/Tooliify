import { test, expect } from '../../shared/bug-capture';
import { SchedulingPage } from '../pages/SchedulingPage';
import { createClients, addQaTool } from '../clients/qa-tools';
import { deleteQaTools } from '../../shared/qa-tools';
import { apiUrl, paths, messages, scheduleTexts, scheduleBody, validSchedule } from '../../../test-data/test-data';

// تستات صفحة الجدولة (قايمة الأدوات). الصفحة بتعرض الأدوات اللي بتدعم الجدولة بس، فكل تست بيضيف أداة QA بالـ API ويحذفها بعد كده.
// بتشتغل في project اسمه "ui-merchant": التاجر بيبقى عامل تسجيل دخول جاهز.
test.describe('Scheduling page – list', () => {
  // التستات دي بتضيف أداة بالـ API، فبنتخطاها لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // الـ Page Object وعملاء الـ API والأداة اللي اتعملت للتست.
  let scheduling: SchedulingPage;
  let api: Awaited<ReturnType<typeof createClients>>;
  let tool: { id: number; name: string };

  // قبل كل تست: نضيف أداة QA بالـ API ونفتح صفحة الجدولة.
  test.beforeEach(async ({ page, playwright }) => {
    api = await createClients(await playwright.request.newContext({ baseURL: apiUrl }));
    tool = await addQaTool(api.myTools);
    scheduling = new SchedulingPage(page);
    await scheduling.open();
  });

  // بعد كل تست: نحذف أي أداة QA فاضلة.
  test.afterEach(async () => {
    if (api) await deleteQaTools(api.myTools);
  });

  // الصفحة بتعرض العنوان والعدد وخانة البحث وزرار جدولة المجموعة.
  test('page shows the title, the count, the search box and the group button', { tag: '@smoke' }, async () => {
    await expect(scheduling.heading).toBeVisible();
    await expect(scheduling.countText).toBeVisible();
    await expect(scheduling.searchInput).toBeVisible();
    await expect(scheduling.groupButton).toBeVisible();
  });

  // الأداة الجديدة بتظهر مفعّلة وغير مجدولة، ومفتاحها معطّل لحد ما تتجدول.
  test('new tool is shown as active and not scheduled', { tag: '@smoke' }, async () => {
    const row = scheduling.row(tool.name);
    await expect(row).toBeVisible();
    await expect(row.getByText(messages.toolActive, { exact: true })).toBeVisible();
    await expect(row.getByText(scheduleTexts.notScheduled)).toBeVisible();
    await expect(scheduling.settingsButton(tool.name)).toBeVisible();
    await expect(scheduling.rowCheckbox(tool.name)).toBeVisible();
    // المتوقع: مفتاح التفعيل معطّل لأن الأداة مش مجدولة.
    await expect(scheduling.rowSwitch(tool.name)).toBeDisabled();
  });

  // العدد المكتوب في الصفحة بيساوي عدد الأدوات اللي الـ API بيرجّعها.
  test('count matches the number of tools in the API', { tag: '@regression' }, async () => {
    const body = await (await api.scheduling.listSchedules()).json();
    expect(await scheduling.addedCount()).toBe(body.data.pagination.total_items);
  });

  // البحث بالاسم بيلاقي الأداة.
  test('search by the tool name finds the tool', { tag: '@regression' }, async () => {
    await scheduling.search(tool.name);
    await expect(scheduling.row(tool.name)).toBeVisible();
  });

  // البحث باسم غلط مبيرجّعش أي صف.
  test('search with a wrong name shows no tools', { tag: '@regression' }, async () => {
    await scheduling.search(`${tool.name}-zzzqqq`);
    await expect(scheduling.rows).toHaveCount(0);
  });

  // الأداة المجدولة بتظهر "مجدولة" وتواريخها.
  test('scheduled tool shows the scheduled status and its dates', { tag: '@smoke' }, async () => {
    await api.scheduling.setSchedule(tool.id, scheduleBody());
    await scheduling.open();
    const row = scheduling.row(tool.name);
    await expect(row.getByText(/مجدولة \(/)).toBeVisible();
    await expect(row).toContainText(validSchedule.shownStart);
    await expect(row).toContainText(validSchedule.shownEnd);
  });

  // حالة الجدولة في الصفحة بتطابق الحالة اللي الـ API بيرجّعها (فترة لسه مبدأتش = "غير نشطة").
  test('scheduled status in the page matches the API status', { tag: '@regression' }, async () => {
    await api.scheduling.setSchedule(tool.id, scheduleBody());
    const rows = (await (await api.scheduling.listSchedules()).json()).data.rows as { id: number; schedule_status_label: string }[];
    const label = rows.find((row) => row.id === tool.id)!.schedule_status_label;
    await scheduling.open();
    await expect(scheduling.row(tool.name).getByText(`${scheduleTexts.scheduled} (${label})`)).toBeVisible();
  });
});

// الشاشة الفاضية: أدوات التاجر الحقيقية مش بتدعم الجدولة، فالصفحة من غير أداة QA بتبقى فاضية.
test.describe('Scheduling page – empty state', () => {
  // الـ Page Object.
  let scheduling: SchedulingPage;

  // قبل كل تست: نتأكد إن مفيش أداة QA فاضلة ونفتح الصفحة.
  test.beforeEach(async ({ page, playwright }) => {
    test.skip(!apiUrl, 'API_URL is not set in .env');
    await deleteQaTools((await createClients(await playwright.request.newContext({ baseURL: apiUrl }))).myTools);
    scheduling = new SchedulingPage(page);
    await scheduling.open();
  });

  // الشاشة الفاضية بتعرض الرسالة والتلميح وزرار الإضافة.
  test('empty state shows the message, the hint and the add button', { tag: '@regression' }, async () => {
    await expect(scheduling.emptyTitle).toBeVisible();
    await expect(scheduling.emptyHint).toBeVisible();
    await expect(scheduling.addToolsButton).toBeVisible();
  });

  // زرار "اضافة ادوات" بيفتح كتالوج الأدوات.
  test('"اضافة ادوات" opens the tools catalog', { tag: '@regression' }, async ({ page }) => {
    await scheduling.addToolsButton.click();
    await expect(page).toHaveURL(new RegExp(`${paths.tools}$`));
  });
});

// التحكم في الوصول.
test.describe('Scheduling page – access', () => {
  // الجزء ده بيشتغل من غير الجلسة المحفوظة (cookies فاضية = زائر مش عامل تسجيل دخول).
  test.use({ storageState: { cookies: [], origins: [] } });

  // الزائر اللي مش عامل تسجيل دخول مينفعش يفتح الجدولة.
  test('scheduling is not accessible without login', { tag: '@regression' }, async ({ page }) => {
    await page.goto(paths.scheduling, { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/auth\?.*callbackUrl=%2Far%2Fscheduling/, { timeout: 30_000 });
  });
});
