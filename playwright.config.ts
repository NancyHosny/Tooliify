import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

// نحمّل المتغيرات من ملف .env (مدعوم في Node 20.12 وأحدث)، بس لو الملف موجود.
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

// نصدّر كائن الإعدادات اللي Playwright بيقراه قبل ما يشغّل التستات.
export default defineConfig({
  // الفولدر اللي فيه كل ملفات التستات.
  // التستات متقسمة حسب الموديول: modules/<module>/ui و modules/<module>/api.
  testDir: './modules',

  // بيتنفذ مرة واحدة في كل تشغيل: بيعمل رقم التشغيل اللي بنسمّي بيه فولدرات السكرينشوتات (auth-V1, auth-V2...).
  globalSetup: './modules/shared/global-setup.ts',

  // أقصى وقت للتست الواحد (30 ثانية).
  timeout: 30_000,

  // أقصى وقت بيفضل فيه expect() الواحد يحاول (10 ثواني).
  expect: { timeout: 10_000 },

  // ملفات التست بتشتغل ورا بعض: تستات الدخول بتشارك حساب حقيقي واحد،
  // والـ SRS 10.2 بيقفل الحساب بعد 5 محاولات فاشلة في 15 دقيقة.
  fullyParallel: false,
  workers: 1,

  // مفيش إعادة محاولة محليًا؛ ومحاولة واحدة في الـ CI عشان نفرّق بين الفشل الحقيقي والتست المتقلب.
  retries: process.env.CI ? 1 : 0,

  // الـ Reporters: قايمة مقروءة في الترمنال + تقرير HTML (مبيتفتحش لوحده على الـ CI).
  reporter: [['list'], ['./modules/shared/terminal-reporter.ts'], ['html', { open: 'never' }]],

  // إعدادات مشتركة بين كل الـ projects اللي تحت.
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // بنسجّل فيديو لكل تست UI عشان تقدري تتفرجي عليه بعدين في تقرير HTML.
    video: 'on',
    locale: 'ar-SA',
    timezoneId: 'Asia/Riyadh',
  },

  // الـ Projects = مجموعات تستات ليها إعداداتها الخاصة.
  projects: [
    {
      // "setup" بيسجّل دخول مرة واحدة ويحفظ الجلسة في .auth/merchant.json،
      // عشان الموديولات الجاية (أدواتي، الكوبونات...) تبدأ وهي عامله دخول جاهز.
      name: 'setup',
      testMatch: 'modules/*/setup/**/*.setup.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // تستات الـ UI بتاعة الـ Auth بتبدأ "من غير تسجيل دخول" قصدًا (دخول، خروج، نسيت كلمة المرور).
      name: 'ui-chromium',
      testMatch: 'modules/auth/ui/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      // تستات الـ UI بتاعة أي موديول تاني بتبدأ "وهي مسجّلة دخول" بالجلسة اللي حفظها "setup".
      name: 'ui-merchant',
      // موديول الأدوات مفيهوش فولدر ui: فيه فولدر لكل أداة (modules/tools/<tool>/*.spec.ts) ومعاه catalog و my-tools.
      testMatch: ['modules/*/ui/**/*.spec.ts', 'modules/tools/**/*.spec.ts'],
      testIgnore: ['modules/auth/**', 'modules/tools/api/**'],
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: '.auth/merchant.json' },
    },
    {
      name: 'api',
      testMatch: 'modules/*/api/**/*.spec.ts',
      use: { baseURL: process.env.API_URL || undefined, video: 'off' },
    },
  ],
});
