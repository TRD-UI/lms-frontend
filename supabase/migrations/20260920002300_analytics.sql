-- ─────────────────────────────────────────────────────────────────────────────
-- Admin analytics.
--
-- Every figure the analytics screen shows was hardcoded in src/data/analytics.ts.
-- These functions compute the same shapes from real rows. Aggregation lives in
-- SQL rather than the browser so the client fetches numbers, not the ledger.
--
-- All of them are admin-only: each checks is_admin() and returns an empty set
-- otherwise, so a non-admin sees empty states instead of an error.
-- ─────────────────────────────────────────────────────────────────────────────

-- ─── Headline tiles ──────────────────────────────────────────────────────────

create or replace function public.analytics_overview()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  revenue bigint;
  learners integer;
  pass_rate integer;
  retention integer;
  started integer;
  completed integer;
begin
  if not public.is_admin() then return '{}'::jsonb; end if;

  select coalesce(sum(amount), 0) into revenue
    from public.payments where status = 'settled';

  select count(distinct student_id) into learners
    from public.enrollments where status in ('active', 'completed');

  select case when count(*) = 0 then 0
              else round(count(*) filter (where passed) * 100.0 / count(*)) end
    into pass_rate
    from public.assessment_attempts where submitted_at is not null;

  -- Retention read as "enrolled learners who got past the first lesson".
  select count(*) into started from public.enrollments where status in ('active','completed');
  select count(*) into completed from public.enrollments
   where status in ('active','completed') and progress > 0;
  retention := case when started = 0 then 0 else round(completed * 100.0 / started) end;

  return jsonb_build_object(
    'revenueKobo', revenue,
    'activeLearners', learners,
    'passRate', pass_rate,
    'retention', retention
  );
end;
$$;

-- ─── Revenue by month ────────────────────────────────────────────────────────

create or replace function public.analytics_revenue(p_months integer default 6)
returns table (month text, tuition bigint, application_fee bigint)
language sql
stable
security definer
set search_path = public
as $$
  select to_char(m.month, 'Mon') as month,
         coalesce(sum(p.amount) filter (where p.purpose = 'tuition'), 0) as tuition,
         coalesce(sum(p.amount) filter (where p.purpose = 'application_fee'), 0) as application_fee
    from generate_series(
           date_trunc('month', now()) - make_interval(months => greatest(p_months, 1) - 1),
           date_trunc('month', now()),
           interval '1 month'
         ) as m(month)
    left join public.payments p
           on date_trunc('month', p.created_at) = m.month
          and p.status = 'settled'
   where public.is_admin()
   group by m.month
   order by m.month;
$$;

-- ─── Enrollment funnel ───────────────────────────────────────────────────────

create or replace function public.analytics_funnel()
returns table (stage text, value bigint)
language sql
stable
security definer
set search_path = public
as $$
  select * from (
    values
      ('Enrolled',    (select count(*) from public.enrollments)),
      ('Paid',        (select count(distinct enrollment_id) from public.payments where status = 'settled' and enrollment_id is not null)),
      ('Active',      (select count(*) from public.enrollments where status in ('active','completed'))),
      ('Started',     (select count(*) from public.enrollments where progress > 0)),
      ('Prerequisite',(select count(distinct att.student_id) from public.assessment_attempts att
                         join public.assessments a on a.id = att.assessment_id
                        where a.gates_entry_pass and att.passed)),
      ('Certified',   (select count(*) from public.certificates where revoked_at is null))
  ) as t(stage, value)
  where public.is_admin();
$$;

-- ─── Payment mix ─────────────────────────────────────────────────────────────

create or replace function public.analytics_payment_mix()
returns table (method text, amount bigint)
language sql
stable
security definer
set search_path = public
as $$
  select p.method::text, coalesce(sum(p.amount), 0)
    from public.payments p
   where p.status = 'settled' and public.is_admin()
   group by p.method
   order by 2 desc;
$$;

-- ─── Top courses by revenue ──────────────────────────────────────────────────

create or replace function public.analytics_top_courses(p_limit integer default 5)
returns table (course text, revenue bigint, enrolled bigint, pass_rate integer)
language sql
stable
security definer
set search_path = public
as $$
  select c.title,
         coalesce(sum(p.amount) filter (where p.status = 'settled'), 0) as revenue,
         (select count(*) from public.enrollments e
           where e.course_id = c.id and e.status in ('active','completed')) as enrolled,
         (select case when count(*) = 0 then 0
                      else round(count(*) filter (where att.passed) * 100.0 / count(*))::int end
            from public.assessment_attempts att
           where att.course_id = c.id and att.submitted_at is not null) as pass_rate
    from public.courses c
    left join public.payments p on p.course_id = c.id
   where public.is_admin()
   group by c.id, c.title
   order by revenue desc
   limit greatest(p_limit, 1);
$$;

-- ─── Course health, by category ──────────────────────────────────────────────

create or replace function public.analytics_course_health()
returns table (
  category text, completion integer, attendance integer,
  pass_rate integer, retention integer, seats_filled integer
)
language sql
stable
security definer
set search_path = public
as $$
  select c.category,
         coalesce(round(avg(e.progress))::int, 0) as completion,
         coalesce((select round(count(*) filter (where ar.status = 'present') * 100.0
                                / nullif(count(*), 0))::int
                     from public.attendance_records ar
                     join public.course_sessions s on s.id = ar.session_id
                     join public.courses c2 on c2.id = s.course_id
                    where c2.category = c.category), 0) as attendance,
         coalesce((select round(count(*) filter (where att.passed) * 100.0
                                / nullif(count(*), 0))::int
                     from public.assessment_attempts att
                     join public.courses c3 on c3.id = att.course_id
                    where c3.category = c.category and att.submitted_at is not null), 0) as pass_rate,
         coalesce(round(count(e.id) filter (where e.progress > 0) * 100.0
                        / nullif(count(e.id), 0))::int, 0) as retention,
         coalesce(round(count(e.id) * 100.0 / nullif(sum(c.seats_total), 0))::int, 0) as seats_filled
    from public.courses c
    left join public.enrollments e on e.course_id = c.id and e.status in ('active','completed')
   where public.is_admin()
   group by c.category
   order by c.category;
$$;

-- ─── Cohort retention ────────────────────────────────────────────────────────
-- A cohort is an intake month; the curve is how far those learners have got.

create or replace function public.analytics_retention()
returns table (cohort text, size bigint, week integer, retained integer)
language sql
stable
security definer
set search_path = public
as $$
  with cohorts as (
    select to_char(date_trunc('month', enrolled_at), 'Mon YYYY') as cohort,
           date_trunc('month', enrolled_at) as month,
           id, progress
      from public.enrollments
     where status in ('active','completed')
  )
  select c.cohort,
         count(*) over (partition by c.cohort) as size,
         w.week,
         round(count(*) filter (where c.progress >= w.week * 20) * 100.0
               / nullif(count(*), 0))::int as retained
    from cohorts c
    cross join generate_series(0, 4) as w(week)
   where public.is_admin()
   group by c.cohort, c.month, w.week
   order by c.month, w.week;
$$;

-- ─── Learner journey ─────────────────────────────────────────────────────────
-- Weighted flow from enrolment through to an outcome, for the Sankey.

create or replace function public.analytics_journey()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  enrolled bigint;
  paid bigint;
  unpaid bigint;
  started bigint;
  idle bigint;
  certified bigint;
  in_progress bigint;
begin
  if not public.is_admin() then return jsonb_build_object('nodes','[]'::jsonb,'links','[]'::jsonb); end if;

  select count(*) into enrolled from public.enrollments;
  select count(*) into paid from public.enrollments where status in ('active','completed');
  unpaid := enrolled - paid;
  select count(*) into started from public.enrollments where progress > 0;
  idle := paid - started;
  select count(*) into certified from public.certificates where revoked_at is null;
  in_progress := greatest(started - certified, 0);

  return jsonb_build_object(
    'nodes', jsonb_build_array(
      jsonb_build_object('name','Enrolled'),
      jsonb_build_object('name','Paid'),
      jsonb_build_object('name','Awaiting payment'),
      jsonb_build_object('name','Started learning'),
      jsonb_build_object('name','Not started'),
      jsonb_build_object('name','Certified'),
      jsonb_build_object('name','In progress')
    ),
    'links', jsonb_build_array(
      jsonb_build_object('source',0,'target',1,'value',greatest(paid,0)),
      jsonb_build_object('source',0,'target',2,'value',greatest(unpaid,0)),
      jsonb_build_object('source',1,'target',3,'value',greatest(started,0)),
      jsonb_build_object('source',1,'target',4,'value',greatest(idle,0)),
      jsonb_build_object('source',3,'target',5,'value',greatest(certified,0)),
      jsonb_build_object('source',3,'target',6,'value',in_progress)
    )
  );
end;
$$;

-- ─── Assessment throughput ───────────────────────────────────────────────────

create or replace function public.analytics_throughput(p_weeks integer default 8)
returns table (week text, attempts bigint, passes bigint)
language sql
stable
security definer
set search_path = public
as $$
  select to_char(w.week, 'DD Mon') as week,
         count(a.id) as attempts,
         count(a.id) filter (where a.passed) as passes
    from generate_series(
           date_trunc('week', now()) - make_interval(weeks => greatest(p_weeks,1) - 1),
           date_trunc('week', now()),
           interval '1 week'
         ) as w(week)
    left join public.assessment_attempts a
           on date_trunc('week', a.submitted_at) = w.week
          and a.submitted_at is not null
   where public.is_admin()
   group by w.week
   order by w.week;
$$;

grant execute on function
  public.analytics_overview(),
  public.analytics_revenue(integer),
  public.analytics_funnel(),
  public.analytics_payment_mix(),
  public.analytics_top_courses(integer),
  public.analytics_course_health(),
  public.analytics_retention(),
  public.analytics_journey(),
  public.analytics_throughput(integer)
  to authenticated;
