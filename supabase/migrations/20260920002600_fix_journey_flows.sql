-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: the learner-journey figures did not describe one population.
--
-- "Certified" counted every certificate on the platform while "Started
-- learning" counted enrolments with progress — so the Sankey could show more
-- learners finishing than ever starting, and a downstream flow larger than its
-- source. A Sankey is a conservation diagram; that reads as nonsense and can
-- make the layout unsolvable.
--
-- Every stage is now measured over enrolments, so each flow is a subset of the
-- one feeding it and the widths add up.
-- ─────────────────────────────────────────────────────────────────────────────

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
  if not public.is_admin() then
    return jsonb_build_object('nodes','[]'::jsonb,'links','[]'::jsonb);
  end if;

  select count(*) into enrolled from public.enrollments;

  select count(*) into paid
    from public.enrollments where status in ('active','completed');
  unpaid := greatest(enrolled - paid, 0);

  -- Only the paid population can start, so this is a strict subset.
  select count(*) into started
    from public.enrollments
   where status in ('active','completed') and progress > 0;
  idle := greatest(paid - started, 0);

  -- Likewise: completion is measured over the same enrolments, not over the
  -- certificates table, which spans learners who may have since withdrawn.
  select count(*) into certified
    from public.enrollments
   where status = 'completed' and progress > 0;
  certified := least(certified, started);
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
      jsonb_build_object('source',0,'target',1,'value',paid),
      jsonb_build_object('source',0,'target',2,'value',unpaid),
      jsonb_build_object('source',1,'target',3,'value',started),
      jsonb_build_object('source',1,'target',4,'value',idle),
      jsonb_build_object('source',3,'target',5,'value',certified),
      jsonb_build_object('source',3,'target',6,'value',in_progress)
    )
  );
end;
$$;
