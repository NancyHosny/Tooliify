// نستورد أنواع الـ Reporter بتاعة Playwright.
import type { Reporter, TestCase, TestResult } from '@playwright/test/reporter';
// نستورد الدالة اللي بتصلّح العربي في الترمنال (توصيل الحروف + عكس الاتجاه).
import { forTerminal } from './arabic-terminal';

// ألوان الترمنال (أكواد ANSI).
const YELLOW = '\u001b[33m';
const CYAN = '\u001b[36m';
const GRAY = '\u001b[90m';
const RED = '\u001b[31m';
const RESET = '\u001b[0m';

// بنستخدم الألوان بس لو الترمنال بيدعمها.
const useColor = Boolean(process.stdout.isTTY || process.env.FORCE_COLOR);

// بنلوّن نص معين (ولو الألوان مش مدعومة بنرجّع النص زي ما هو).
function paint(color: string, text: string): string {
  return useColor ? color + text + RESET : text;
}

// بنلوّن سطر واحد من الملخص: العنوان أصفر، عناوين الأقسام سماوي، والرابط رمادي.
function colorLine(line: string): string {
  if (line.startsWith('━━')) return paint(YELLOW, line);
  if (line.startsWith('▸')) return paint(CYAN, line);
  if (line.startsWith('http')) return paint(GRAY, line);
  return line;
}

// سطر واحد في القايمة النهائية: عنوان التست + معلومة إضافية (مكان السكرينشوت أو سبب التخطي).
type Item = { title: string; extra: string };

// Reporter صغير بيعمل حاجتين:
// 1) بعد كل تست بيطبع نص "terminal-summary" اللي جهّزه bug-capture.ts.
// 2) في آخر التشغيل بيطبع قايمة التستات الفاشلة (مع مكان السكرينشوت) والمتخطية (مع السبب).
export default class TerminalSummaryReporter implements Reporter {
  // التستات الفاشلة: العنوان + مكان حفظ السكرينشوت.
  private failed: Item[] = [];
  // التستات المتخطية: العنوان + السبب.
  private skipped: Item[] = [];

  // بيتنفذ مرة واحدة لما Playwright يشغّل الـ reporter (قبل أول تست).
  constructor() {
    // بنغلّف دالة الكتابة في الترمنال: أي نص بيتطبع (حتى سطور reporter الـ list الجاهز بتاع Playwright) بنصلّح العربي اللي فيه
    // (توصيل الحروف وعكس الاتجاه) قبل ما يتكتب. النص اللي اتصلّح قبل كده مبيتأثرش لو عدّى هنا تاني.
    const originalWrite = process.stdout.write.bind(process.stdout);
    process.stdout.write = ((chunk: any, ...rest: any[]) =>
      originalWrite(typeof chunk === 'string' ? forTerminal(chunk) : chunk, ...rest)) as typeof process.stdout.write;
  }

  // Playwright بينده الدالة دي كل ما تست يخلص.
  onTestEnd(test: TestCase, result: TestResult) {
    // اسم التست زي ما هيتعرض في القايمة: "describe › test".
    const title = test.titlePath().filter((part) => part && !part.endsWith('.ts') && !/^\[/.test(part)).join(' › ');

    // بنفتكر التستات الفاشلة (تست نجح في المحاولة التانية مش بيتحسب فاشل).
    if (result.status === 'failed' || result.status === 'timedOut') {
      const shot = result.attachments.find((a) => a.name === 'saved-screenshot')?.body?.toString('utf-8');
      this.failed.push({ title, extra: shot ?? 'no screenshot (the page was already closed)' });
    }

    // بنفتكر التستات المتخطية مع السبب المكتوب في test.skip(condition, 'reason').
    if (result.status === 'skipped') {
      const reason = test.annotations.find((a) => a.type === 'skip')?.description ?? 'no reason given';
      this.skipped.push({ title, extra: reason });
    }

    // بندوّر على النص اللي bug-capture ضافه للتست.
    const summary = result.attachments.find((a) => a.name === 'terminal-summary');
    // مفيش حاجة نطبعها (التست نجح من غير أخطاء API، أو اتخطى).
    if (!summary?.body) return;
    const text = summary.body.toString('utf-8');
    // بنطبع الملخص بين سطرين فاضيين عشان يبان.
    console.log('\n' + (useColor ? text.split('\n').map(colorLine).join('\n') : text) + '\n');
  }

  // بتتنده مرة واحدة لما التشغيل كله يخلص: بنطبع القايمتين.
  onEnd() {
    // لو مفيش فاشل ولا متخطي، مفيش حاجة نطبعها.
    if (this.failed.length === 0 && this.skipped.length === 0) return;

    // التستات الفاشلة.
    if (this.failed.length > 0) {
      console.log('\n' + paint(RED, `━━ ❌ Failed tests (${this.failed.length}) ━━`));
      this.failed.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item.title}`);
        console.log(paint(GRAY, `     📷 ${item.extra}`));
      });
    }

    // التستات المتخطية متجمعة حسب السبب، عشان السبب نفسه ميتكررش.
    if (this.skipped.length > 0) {
      console.log('\n' + paint(YELLOW, `━━ ⏭ Skipped tests (${this.skipped.length}) ━━`));
      const byReason = new Map<string, string[]>();
      for (const item of this.skipped) {
        byReason.set(item.extra, [...(byReason.get(item.extra) ?? []), item.title]);
      }
      for (const [reason, titles] of byReason) {
        console.log(`  Reason: ${reason}`);
        titles.forEach((title) => console.log(paint(GRAY, `   - ${title}`)));
      }
    }
    console.log('');
  }

  // الـ Reporter ده بيزوّد طباعة بس، فخلّينا reporter الـ list يطبع سطوره العادية.
  printsToStdio() {
    return false;
  }
}
