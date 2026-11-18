// نستورد test و expect (ومعاهم الالتقاط الأوتوماتيك للأخطاء).
import { test, expect } from '../../shared/bug-capture';
// نستورد الـ Page Object وانتظار حد الطلبات.
import { DashboardPage } from '../pages/DashboardPage';
import { waitForStatisticsSlot } from '../clients/rate-limit';
// نستورد بيانات التست.
import { paths, dashboardTexts, dashboardTextsEn, sidebarLinks } from '../../../test-data/test-data';

// الشريط الجانبي والشريط العلوي في لوحة التحكم (الروابط، الثيم، اللغة، طي الشريط).
test.describe('Dashboard – sidebar and header', () => {
  // الصفحة بتنده الإحصائيات اللي حدها 10 طلبات في الدقيقة، فممكن التست يستنى شوية قبل ما يفتحها.
  test.describe.configure({ timeout: 90_000 });

  // الـ Page Object.
  let dashboard: DashboardPage;

  // قبل كل تست: نفتح لوحة التحكم.
  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.open();
  });

  // كل رابط في الشريط الجانبي بيفتح صفحته.
  for (const link of sidebarLinks) {
    test(`sidebar link opens its page: ${link.name}`, { tag: '@regression' }, async ({ page }) => {
      // نضغط على الرابط.
      await dashboard.sidebarLink(link.path).click();
      // المتوقع: الصفحة اتفتحت.
      await expect(page).toHaveURL(new RegExp(`${link.path}$`));
    });
  }

  // زرار الثيم بيبدّل بين الفاتح والغامق.
  test('theme button switches between light and dark', { tag: '@regression' }, async ({ page }) => {
    // المتوقع: الصفحة فاتحة في الأول.
    await expect(page.locator('html')).toHaveClass(/light/);
    // نضغط على الزرار.
    await dashboard.themeButton.click();
    // المتوقع: بقت غامقة.
    await expect(page.locator('html')).toHaveClass(/dark/);
    // نضغط تاني.
    await dashboard.themeButton.click();
    // المتوقع: رجعت فاتحة.
    await expect(page.locator('html')).toHaveClass(/light/);
  });

  // زرار اللغة بيفتح الصفحة بالإنجليزي من الشمال لليمين.
  test('language button switches the page to English', { tag: '@regression' }, async ({ page }) => {
    // الصفحة الإنجليزي هتنده الإحصائيات كمان مرة، فنستنى مكان في حد الطلبات الأول.
    await waitForStatisticsSlot();
    await dashboard.languageButton.click();
    // المتوقع: الرابط والاتجاه واللغة اتغيروا.
    await expect(page).toHaveURL(new RegExp(`${paths.dashboardEn}$`));
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    // المتوقع: العناوين بالإنجليزي.
    for (const text of [dashboardTextsEn.activeTotal, dashboardTextsEn.clicks, dashboardTextsEn.views, dashboardTextsEn.activeSection, dashboardTextsEn.showAll]) {
      await expect(page.getByText(text, { exact: true }).first()).toBeVisible();
    }
  });

  // زرار طي الشريط الجانبي بيخفي أسماء الأقسام.
  test('collapse button hides the sidebar labels', { tag: '@regression' }, async ({ page }) => {
    // المتوقع: اسم القسم ظاهر في الأول.
    const label = dashboard.sidebarLink(paths.myTools).getByText('أدواتي', { exact: true });
    await expect(label).toBeVisible();
    // نطوي الشريط.
    await dashboard.collapseButton.click();
    // المتوقع: الاسم اختفى والرابط لسه موجود (أيقونة بس).
    await expect(label).toBeHidden();
    await expect(dashboard.sidebarLink(paths.myTools)).toBeVisible();
  });
});

// الدخول من غير تسجيل دخول.
test.describe('Dashboard – access', () => {
  // التست ده من غير جلسة دخول.
  test.use({ storageState: { cookies: [], origins: [] } });

  // زائر مش مسجل دخول بيتحوّل لصفحة الدخول.
  test('visitor without login is sent to the login page', { tag: '@critical' }, async ({ page }) => {
    // نفتح لوحة التحكم من غير دخول.
    await page.goto(paths.dashboard, { waitUntil: 'domcontentloaded' });
    // المتوقع: اتحوّلنا لصفحة الدخول ومفيش عنوان لوحة التحكم.
    await expect(page).toHaveURL(new RegExp(paths.login));
    await expect(page.getByRole('heading', { name: dashboardTexts.title, exact: true })).toHaveCount(0);
  });
});
