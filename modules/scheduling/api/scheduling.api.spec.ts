import { test, expect } from '../../shared/bug-capture';
import { SchedulingClient } from '../clients/SchedulingClient';
import { createClients, addQaTool } from '../clients/qa-tools';
import { deleteQaTools } from '../../shared/qa-tools';
import {
  apiUrl, unknownId, scheduleBody, clearScheduleBody, invalidScheduleBodies, invalidScheduleFlags, invalidGroupSchedules,
  scheduleStatuses, scheduleApi, fakeJwt,
} from '../../../test-data/test-data';

// صف واحد من قايمة الجدولة (من الـ schema اسمه ScheduleMerchantToolResource في الـ OpenAPI).
type Row = {
  id: number; tool_id: number; slug: string; display_name: string; status: string;
  is_schedule: boolean; schedule_status: string; schedule_status_label: string; schedule: { start_at: string; end_at: string } | null;
};

// نجيب صفوف الجدولة من رد الـ API.
async function rowsOf(client: SchedulingClient, filters: Record<string, string> = {}): Promise<Row[]> {
  return (await (await client.listSchedules(filters)).json()).data.rows;
}

// تستات API للجدولة (تاج الـ OpenAPI: "Tool Scheduling").
test.describe('Scheduling – API', () => {
  // نتخطى كل التستات لو API_URL مش مكتوب في ملف .env.
  test.skip(!apiUrl, 'API_URL is not set in .env');

  // العملاء وأداة QA اللي اتعملت للتست (بتتعمل من جديد لكل تست).
  let api: Awaited<ReturnType<typeof createClients>>;
  let tool: { id: number; name: string };

  // قبل كل تست: نسجّل دخول ونضيف أداة QA.
  test.beforeEach(async ({ request }) => {
    api = await createClients(request);
    tool = await addQaTool(api.myTools);
  });

  // بعد كل تست: نحذف كل أداة اسمها بيبدأ ببادئة QA.
  test.afterEach(async () => {
    if (api) await deleteQaTools(api.myTools);
  });

  // ---------- القايمة ----------

  // القايمة بترجّع صف الأداة بكل حقوله وهي غير مجدولة.
  test('list returns the tool as active and not scheduled', { tag: '@smoke' }, async () => {
    const response = await api.scheduling.listSchedules();
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toBe(scheduleApi.rowsKey);
    const row = (body.data.rows as Row[]).find((item) => item.id === tool.id)!;
    expect(row.display_name).toBe(tool.name);
    expect(row.status).toBe('active');
    expect(row.is_schedule).toBe(false);
    expect(row.schedule_status).toBe('not_scheduled');
    expect(row.schedule).toBeNull();
    expect(body.data.pagination.total_items).toBeGreaterThanOrEqual(1);
  });

  // لما مفيش أي أداة بتدعم الجدولة القايمة بترجّع رسالة "مفيش أدوات".
  test('list without schedulable tools returns the "no tools" key', { tag: '@regression' }, async () => {
    await deleteQaTools(api.myTools);
    const response = await api.scheduling.listSchedules();
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toBe(scheduleApi.noToolsKey);
    expect(body.data.rows).toEqual([]);
  });

  // فلتر البحث بالاسم بيلاقي الأداة، واسم غلط بيرجّع قايمة فاضية.
  test('search filter finds the tool by its name', { tag: '@regression' }, async () => {
    expect((await rowsOf(api.scheduling, { 'filter[search]': tool.name })).map((row) => row.id)).toContain(tool.id);
    expect(await rowsOf(api.scheduling, { 'filter[search]': 'zzzqqq' })).toEqual([]);
  });

  // فلتر حالة التفعيل: الأداة مفعّلة فبتظهر في "active" ومبتظهرش في "inactive".
  test('status filter separates active and inactive tools', { tag: '@regression' }, async () => {
    expect((await rowsOf(api.scheduling, { 'filter[status]': 'active' })).map((row) => row.id)).toContain(tool.id);
    expect((await rowsOf(api.scheduling, { 'filter[status]': 'inactive' })).map((row) => row.id)).not.toContain(tool.id);
  });

  // فلتر is_schedule: الأداة بتظهر في false قبل الجدولة، وفي true بعدها.
  test('is_schedule filter follows the schedule', { tag: '@regression' }, async () => {
    expect((await rowsOf(api.scheduling, { 'filter[is_schedule]': '0' })).map((row) => row.id)).toContain(tool.id);
    expect((await rowsOf(api.scheduling, { 'filter[is_schedule]': '1' })).map((row) => row.id)).not.toContain(tool.id);
    await api.scheduling.setSchedule(tool.id, scheduleBody());
    expect((await rowsOf(api.scheduling, { 'filter[is_schedule]': '1' })).map((row) => row.id)).toContain(tool.id);
    expect((await rowsOf(api.scheduling, { 'filter[is_schedule]': '0' })).map((row) => row.id)).not.toContain(tool.id);
  });

  // فلتر schedule_status بيقبل كل القيم المكتوبة في الـ OpenAPI.
  test('schedule_status filter accepts every documented value', { tag: '@regression' }, async () => {
    // نجرّب كل قيمة.
    for (const status of scheduleStatuses) {
      expect((await api.scheduling.listSchedules({ 'filter[schedule_status]': status })).status(), status).toBe(200);
    }
  });

  // فلتر schedule_status بيرفض قيمة مش معروفة.
  test('schedule_status filter rejects an unknown value', { tag: '@regression' }, async () => {
    const response = await api.scheduling.listSchedules({ 'filter[schedule_status]': 'upcoming' });
    expect(response.status()).toBe(422);
  });

  // ---------- جدولة أداة واحدة ----------

  // جدولة صحيحة بتتحفظ والأداة بتبقى "pending" (الفترة لسه مبدأتش).
  test('valid schedule is saved', { tag: '@smoke' }, async () => {
    const response = await api.scheduling.setSchedule(tool.id, scheduleBody());
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toBe(scheduleApi.setKey);
    expect(body.msg).toBe(scheduleApi.setMessage);
    expect(body.data.is_schedule).toBe(true);
    expect(body.data.schedule_status).toBe('pending');
    expect(body.data.schedule.start_at).toContain('2030-01-10');
    expect(body.data.schedule.end_at).toContain('2030-01-20');
    const row = (await rowsOf(api.scheduling)).find((item) => item.id === tool.id)!;
    expect(row.is_schedule).toBe(true);
  });

  // إلغاء الجدولة بيرجّع الأداة غير مجدولة.
  test('clearing the schedule makes the tool not scheduled again', { tag: '@smoke' }, async () => {
    await api.scheduling.setSchedule(tool.id, scheduleBody());
    const response = await api.scheduling.setSchedule(tool.id, clearScheduleBody);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.msg).toBe(scheduleApi.clearMessage);
    expect(body.data.is_schedule).toBe(false);
    expect(body.data.schedule_status).toBe('not_scheduled');
    expect(body.data.schedule).toBeNull();
  });

  // الأجسام الغلط (تواريخ ناقصة أو معكوسة أو في الماضي أو بشكل غلط) بترجّع 422 ورسالتها.
  for (const item of invalidScheduleBodies) {
    test(`invalid schedule is rejected: ${item.name}`, { tag: '@regression' }, async () => {
      const response = await api.scheduling.setSchedule(tool.id, item.body);
      expect(response.status()).toBe(422);
      expect((await response.json()).msg).toBe(item.message);
      expect((await rowsOf(api.scheduling)).find((row) => row.id === tool.id)!.is_schedule).toBe(false);
    });
  }

  // is_schedule ناقص أو بنوع غلط بيرجّع 422.
  for (const item of invalidScheduleFlags) {
    test(`invalid flag is rejected: ${item.name}`, { tag: '@regression' }, async () => {
      const response = await api.scheduling.setSchedule(tool.id, item.body);
      expect(response.status()).toBe(422);
    });
  }

  // جدولة أداة مش موجودة بترجّع 404.
  test('scheduling an unknown tool returns 404', { tag: '@regression' }, async () => {
    const response = await api.scheduling.setSchedule(unknownId, scheduleBody());
    expect(response.status()).toBe(404);
  });

  // ---------- جدولة مجموعة ----------

  // جدولة مجموعة صحيحة بتتحفظ.
  test('valid group schedule is saved', { tag: '@smoke' }, async () => {
    const response = await api.scheduling.setGroupSchedule({
      merchant_tool_ids: [tool.id], start_at: scheduleBody().start_at, end_at: scheduleBody().end_at,
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.key).toBe(scheduleApi.groupKey);
    expect(body.msg).toBe(scheduleApi.groupMessage);
    const row = (body.data as Row[]).find((item) => item.id === tool.id)!;
    expect(row.is_schedule).toBe(true);
  });

  // أجسام المجموعة الغلط بترجّع 422.
  for (const item of invalidGroupSchedules) {
    test(`invalid group schedule is rejected: ${item.name}`, { tag: '@regression' }, async () => {
      const response = await api.scheduling.setGroupSchedule({ merchant_tool_ids: [tool.id], ...item.body });
      expect(response.status()).toBe(422);
    });
  }

  // مجموعة من غير أدوات بترجّع 422.
  test('group schedule without tools is rejected', { tag: '@regression' }, async () => {
    const response = await api.scheduling.setGroupSchedule({ merchant_tool_ids: [], ...scheduleBody() });
    expect(response.status()).toBe(422);
  });

  // مجموعة فيها id مش موجود بترجّع 422.
  test('group schedule with an unknown tool is rejected', { tag: '@regression' }, async () => {
    const response = await api.scheduling.setGroupSchedule({
      merchant_tool_ids: [unknownId], start_at: scheduleBody().start_at, end_at: scheduleBody().end_at,
    });
    expect(response.status()).toBe(422);
  });

  // ---------- التوكن ----------

  // كل endpoints الجدولة محتاجة توكن.
  test('scheduling endpoints without token return 401', { tag: '@critical' }, async ({ request }) => {
    const noToken = new SchedulingClient(request, '');
    expect((await noToken.listSchedules()).status()).toBe(401);
    expect((await noToken.setSchedule(tool.id, clearScheduleBody)).status()).toBe(401);
    expect((await noToken.setGroupSchedule({ merchant_tool_ids: [tool.id], ...scheduleBody() })).status()).toBe(401);
  });

  // توكن مزيّف بيترفض.
  test('scheduling endpoints with a fake token return 401', { tag: '@regression' }, async ({ request }) => {
    const fake = new SchedulingClient(request, fakeJwt);
    expect((await fake.listSchedules()).status()).toBe(401);
  });
});
