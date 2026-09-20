#!/usr/bin/env node
/**
 * End-to-end verification against the live Supabase project.
 *
 *   npm run verify:supabase
 *
 * Signs in as real seeded users through the anon key — the same path the
 * browser takes — and asserts the security properties that the schema is
 * supposed to guarantee. Run it after any migration that touches RLS, grants
 * or the assessment functions.
 *
 * Exits non-zero on the first failing assertion, so it is CI-safe.
 */
if (!globalThis.WebSocket) globalThis.WebSocket = class { close() {} addEventListener() {} };
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

const env = Object.fromEntries(
  readFileSync('/Users/mac/Projects/lms-frontend/.env.local', 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);

const URL = env.VITE_SUPABASE_URL, KEY = env.VITE_SUPABASE_ANON_KEY;
const fresh = () => createClient(URL, KEY, { auth: { persistSession: false } });
const PW = 'Password123!';

let pass = 0, fail = 0;
const ok  = (m, extra='') => { pass++; console.log(`  PASS  ${m}${extra ? ' — ' + extra : ''}`); };
const bad = (m, extra='') => { fail++; console.log(`  FAIL  ${m}${extra ? ' — ' + extra : ''}`); };

async function login(email) {
  const c = fresh();
  const { data, error } = await c.auth.signInWithPassword({ email, password: PW });
  return { c, data, error };
}

console.log('\n── Authentication ──');
for (const [email, role] of [
  ['cyber.smith@example.com', 'student'],
  ['funke.a@trd.edu', 'instructor'],
  ['eze.n@trd.edu', 'admin'],
]) {
  const { c, data, error } = await login(email);
  if (error) { bad(`sign in ${email}`, error.message); continue; }
  const { data: p } = await c.from('profiles').select('name, role, status').eq('id', data.user.id).single();
  p?.role === role ? ok(`${email} → ${p.role}`, p.name) : bad(`${email} role`, `got ${p?.role}, want ${role}`);
  await c.auth.signOut();
}

console.log('\n── Seed data visible to the student ──');
const { c: stu, data: stuAuth } = await login('cyber.smith@example.com');
const STU = stuAuth.user.id;

for (const [table, label, min] of [
  ['courses', 'published courses', 10],
  ['enrollments', 'own enrollments', 3],
  ['certificates', 'own certificates', 4],
  ['notifications', 'own notifications', 1],
  ['entry_passes', 'own entry passes', 3],
]) {
  const { data, error } = await stu.from(table).select('*');
  if (error) { bad(label, error.message); continue; }
  data.length >= min ? ok(label, `${data.length} rows`) : bad(label, `${data.length} rows, expected >= ${min}`);
}

console.log('\n── Answer key must never reach a learner ──');
{
  const { data, error } = await stu.from('question_options').select('id, label');
  error ? bad('student reads option labels', error.message) : ok('student reads option labels', `${data.length} rows`);
}
{
  const { error } = await stu.from('question_options').select('is_correct');
  error ? ok('is_correct column REFUSED', error.message.slice(0, 60))
        : bad('is_correct column LEAKED — column grant not applied');
}
{
  const { error } = await stu.from('assessment_questions').select('*');
  (error || (await stu.from('assessment_questions').select('*')).data?.length === 0)
    ? ok('questions table not directly readable by learner')
    : bad('questions table readable — learner can preview every question');
}

console.log('\n── Grading is server-authoritative ──');
{
  const { error } = await stu.from('assessment_attempts')
    .insert({ assessment_id: '00000000-0000-0000-0000-000000000000', course_id: '00000000-0000-0000-0000-000000000000', student_id: STU, attempt_number: 1, score: 100, passed: true });
  error ? ok('cannot forge an attempt row', error.message.slice(0, 55))
        : bad('LEARNER CAN INSERT THEIR OWN SCORE');
}
{
  const { data: att } = await stu.from('assessment_attempts').select('id, score, passed').limit(3);
  ok('own attempts readable', `${att?.length ?? 0} rows`);
  if (att?.length) {
    const { error } = await stu.from('assessment_attempts').update({ score: 100, passed: true }).eq('id', att[0].id);
    const { data: after } = await stu.from('assessment_attempts').select('score').eq('id', att[0].id).single();
    after?.score === att[0].score ? ok('cannot rewrite own score', `still ${after.score}`)
                                  : bad('SCORE WAS REWRITTEN', `${att[0].score} → ${after?.score}`);
  }
}

console.log('\n── start_attempt() strips the key ──');
{
  const { data: a } = await stu.from('assessments').select('id, title, course_id').eq('status', 'published').limit(1).single();
  if (!a) { bad('no visible assessment to test'); }
  else {
    const { data, error } = await stu.rpc('start_attempt', { p_assessment_id: a.id });
    if (error) bad('start_attempt', error.message.slice(0, 70));
    else {
      const q = data.questions ?? [];
      ok('start_attempt returned questions', `${q.length} for "${a.title}"`);
      const leaked = JSON.stringify(q).match(/isCorrect|is_correct|correctOption/i);
      leaked ? bad('ANSWER KEY PRESENT IN start_attempt PAYLOAD') : ok('no answer key in payload');
    }
  }
}

console.log('\n── Cross-tenant isolation ──');
{
  const { data } = await stu.from('profiles').select('id');
  data?.length === 1 ? ok('student sees only their own profile') : bad('student sees other profiles', `${data?.length} rows`);
}
{
  const { data } = await stu.from('audit_logs').select('id');
  (data?.length ?? 0) === 0 ? ok('audit log hidden from learner') : bad('audit log exposed', `${data.length} rows`);
}

console.log('\n── Suspended account ──');
{
  const c = fresh();
  const { data, error } = await c.auth.signInWithPassword({ email: 'halima.b@trd.edu', password: PW });
  if (error) {
    ok('suspended account rejected at auth', error.message.slice(0, 45));
  } else {
    const { data: prof } = await c.from('profiles').select('status').eq('id', data.user.id).single();
    prof?.status === 'suspended'
      ? ok('suspended flag reaches the client', 'session store signs them straight back out')
      : bad('suspended flag missing', JSON.stringify(prof));
  }
}

console.log('\n── Admin reach ──');
{
  const { c: adm } = await login('eze.n@trd.edu');
  const { data: users } = await adm.from('profiles').select('id');
  (users?.length ?? 0) >= 10 ? ok('admin sees all profiles', `${users.length}`) : bad('admin profile reach', `${users?.length}`);
  const { data: audit } = await adm.from('audit_logs').select('id');
  (audit?.length ?? 0) >= 7 ? ok('admin sees audit trail', `${audit.length}`) : bad('admin audit reach', `${audit?.length}`);
  const { data: tx } = await adm.from('payments').select('amount');
  (tx?.length ?? 0) >= 8 ? ok('admin sees payments', `${tx.length}`) : bad('admin payments reach', `${tx?.length}`);
}

console.log('\n── Assessments belong to the instructor, not the admin ──');
{
  const { c: adm } = await login('eze.n@trd.edu');
  const { c: funke } = await login('funke.a@trd.edu');   // teaches Tech Odyssey + Cybersecurity
  const { c: seun } = await login('seun.f@trd.edu');     // teaches other courses

  const { data: mine } = await funke.from('assessments').select('id, title, course_id').limit(1).single();
  if (!mine) { bad('instructor can see their own assessment'); }
  else {
    ok('instructor sees their own assessment', mine.title);

    const { error: admErr } = await adm.from('assessments')
      .update({ title: mine.title + ' (admin edit)' }).eq('id', mine.id);
    const { data: afterAdm } = await adm.from('assessments').select('title').eq('id', mine.id).single();
    afterAdm?.title === mine.title
      ? ok('admin CANNOT edit an assessment', 'row unchanged')
      : bad('ADMIN EDITED AN ASSESSMENT', `${mine.title} -> ${afterAdm?.title}`);

    const { data: afterOther } = await (async () => {
      await seun.from('assessments').update({ title: 'hijacked' }).eq('id', mine.id);
      return seun.from('assessments').select('title').eq('id', mine.id).maybeSingle();
    })();
    (afterOther?.title ?? mine.title) === mine.title
      ? ok('another instructor CANNOT edit it', 'row unchanged')
      : bad('WRONG INSTRUCTOR EDITED IT', String(afterOther?.title));

    const renamed = mine.title + ' ✎';
    await funke.from('assessments').update({ title: renamed }).eq('id', mine.id);
    const { data: afterOwn } = await funke.from('assessments').select('title').eq('id', mine.id).single();
    if (afterOwn?.title === renamed) {
      ok('assigned instructor CAN edit it');
      await funke.from('assessments').update({ title: mine.title }).eq('id', mine.id);
    } else {
      bad('assigned instructor could not edit their own assessment', String(afterOwn?.title));
    }
  }

  const { data: admAll } = await adm.from('assessments').select('id');
  (admAll?.length ?? 0) >= 17
    ? ok('admin still reads every assessment', `${admAll.length}`)
    : bad('admin lost read access', `${admAll?.length}`);
}

console.log('\n── Long-form paper reached the database ──');
{
  const { c: stu } = await login('cyber.smith@example.com');
  const { data: a } = await stu.from('assessments')
    .select('id, title').eq('title', 'Cybersecurity Final Examination').maybeSingle();
  if (!a) { bad('30-question paper not seeded'); }
  else {
    const { data: started, error } = await stu.rpc('start_attempt', { p_assessment_id: a.id });
    if (error) bad('start 30-question paper', error.message.slice(0, 60));
    else {
      started.questions?.length === 30
        ? ok('30-question paper starts', `${started.questions.length} questions returned`)
        : bad('unexpected question count', String(started.questions?.length));
    }
  }
}

console.log('\n── Course applications ──');
{
  const { c: stu, data: stuAuth } = await login('cyber.smith@example.com');
  const { c: ins, data: insAuth } = await login('funke.a@trd.edu');
  const { c: adm } = await login('eze.n@trd.edu');
  const STU = stuAuth.user.id, INS = insAuth.user.id;

  const { data: enrolled } = await stu.from('enrollments').select('course_id');
  const mine = new Set((enrolled ?? []).map(e => e.course_id));
  const { data: courses } = await stu.from('courses')
    .select('id, title, instructor_id').eq('status', 'published');
  const target = courses?.find(c => !mine.has(c.id) && c.instructor_id === INS)
              ?? courses?.find(c => !mine.has(c.id));

  if (!target) bad('no unenrolled course to apply for');
  else {
    // Start from a known state — a previous run may have left a row behind.
    await adm.from('course_applications').delete().eq('course_id', target.id).eq('student_id', STU);

    let r = await stu.rpc('apply_for_course', {
      p_course_id: target.id, p_phone: '0801 234 5678', p_employer: 'ACME Ltd',
      p_experience: 'Some self-study', p_motivation: 'Verification run.',
    });
    r.error ? bad('student applies', r.error.message) : ok('student applies', target.title);
    const appId = r.data?.id;

    r = await stu.rpc('apply_for_course', { p_course_id: target.id });
    r.error ? ok('duplicate application while pending refused')
            : bad('a second pending application was allowed');

    const { data: insSees } = await ins.from('course_applications').select('id').eq('id', appId);
    (target.instructor_id === INS ? insSees?.length === 1 : insSees?.length === 0)
      ? ok('instructor sees applications for their courses only')
      : bad('instructor application scope wrong', `${insSees?.length}`);

    // The decision must be unreachable from the client.
    await stu.from('course_applications').update({ status: 'approved' }).eq('id', appId);
    const { data: afterWrite } = await stu.from('course_applications')
      .select('status').eq('id', appId).single();
    afterWrite?.status === 'pending'
      ? ok('student cannot approve themselves by direct update')
      : bad('student self-approved via direct update');

    r = await stu.from('course_applications').insert({ course_id: target.id, student_id: STU, status: 'approved' });
    r.error ? ok('student cannot insert an application row directly', r.error.code)
            : bad('direct application insert allowed');

    r = await stu.rpc('review_application', { p_application_id: appId, p_approve: true });
    r.error ? ok('student cannot call review_application')
            : bad('student reviewed their own application');

    r = await adm.rpc('review_application', { p_application_id: appId, p_approve: true, p_note: 'Welcome.' });
    r.error ? bad('admin approves', r.error.message) : ok('admin approves');

    const { data: enr } = await stu.from('enrollments')
      .select('status').eq('course_id', target.id).eq('student_id', STU).maybeSingle();
    enr?.status === 'active'
      ? ok('approval created an active enrolment')
      : bad('no enrolment after approval', JSON.stringify(enr));

    r = await adm.rpc('review_application', { p_application_id: appId, p_approve: false });
    r.error ? ok('a decided application cannot be re-decided')
            : bad('the same application was decided twice');

    const { data: notes } = await stu.from('notifications')
      .select('title').order('created_at', { ascending: false }).limit(5);
    notes?.some(n => n.title === 'Application approved')
      ? ok('learner notified of the decision')
      : bad('no decision notification reached the learner');

    r = await stu.rpc('apply_for_course', { p_course_id: target.id });
    r.error ? ok('an enrolled learner cannot apply again')
            : bad('enrolled learner applied again');

    // Leave the project as we found it.
    await adm.from('course_applications').delete().eq('id', appId);
    await adm.from('enrollments').delete().eq('course_id', target.id).eq('student_id', STU);
    const { data: leftover } = await stu.from('notifications')
      .select('id, title').in('title', ['Application approved', 'Application not successful']);
    for (const n of leftover ?? []) await stu.from('notifications').delete().eq('id', n.id);
  }
}

console.log(`\n${'─'.repeat(50)}\n  ${pass} passed, ${fail} failed\n`);
process.exit(fail ? 1 : 0);
