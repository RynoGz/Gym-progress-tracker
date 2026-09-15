create table public.workout_templates (
  id uuid primary key default gen_random_uuid(),

  owner_id uuid not null
    default auth.uid()
    references auth.users (id)
    on delete cascade,

  name text not null,

  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint workout_templates_name_not_blank
    check (char_length(btrim(name)) > 0)
);

create index workout_templates_owner_id_idx
  on public.workout_templates (owner_id);


create table public.template_exercises (
  template_id uuid not null
    references public.workout_templates (id)
    on delete cascade,

  exercise_id uuid not null
    references public.exercises (id)
    on delete restrict,

  position integer not null,
  default_sets integer not null,
  created_at timestamptz not null default now(),

  constraint template_exercises_primary_key
    primary key (template_id, exercise_id),

  constraint template_exercises_position_unique
    unique (template_id, position),

  constraint template_exercises_position_valid
    check (position >= 0),

  constraint template_exercises_default_sets_valid
    check (default_sets >= 1)
);

create index template_exercises_exercise_id_idx
  on public.template_exercises (exercise_id);


alter table public.workout_templates enable row level security;
alter table public.template_exercises enable row level security;

revoke all
  on table public.workout_templates
  from anon, authenticated;

revoke all
  on table public.template_exercises
  from anon, authenticated;

grant select
  on table public.workout_templates
  to authenticated;

grant select
  on table public.template_exercises
  to authenticated;


create policy "workout_templates_select_own"
  on public.workout_templates
  for select
  to authenticated
  using (owner_id = (select auth.uid()));

create policy "template_exercises_select_own"
  on public.template_exercises
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.workout_templates
      where workout_templates.id = template_exercises.template_id
        and workout_templates.owner_id = (select auth.uid())
    )
  );


create function public.create_workout_template(
  p_template_name text,
  p_exercises jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_template_id uuid;
  v_item_count integer;
  v_distinct_exercise_count integer;
  v_minimum_default_sets integer;
  v_valid_exercise_count integer;
begin
  v_user_id := (select auth.uid());

  if v_user_id is null then
    raise exception 'Authentication is required'
      using errcode = '42501';
  end if;

  if p_template_name is null or btrim(p_template_name) = '' then
    raise exception 'Template name is required'
      using errcode = '22023';
  end if;

  if p_exercises is null then
    raise exception 'Exercises are required'
      using errcode = '22023';
  end if;

  if jsonb_typeof(p_exercises) <> 'array' then
    raise exception 'Exercises must be provided as an array'
      using errcode = '22023';
  end if;

  if jsonb_array_length(p_exercises) = 0 then
    raise exception 'A template must contain at least one exercise'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_exercises) as item(value)
    where item.value ->> 'exercise_id' is null
       or item.value ->> 'default_sets' is null
  ) then
    raise exception 'Every exercise requires exercise_id and default_sets'
      using errcode = '22023';
  end if;

  select
    count(*)::integer,
    count(
      distinct ((item.value ->> 'exercise_id')::uuid)
    )::integer,
    min((item.value ->> 'default_sets')::integer)
  into
    v_item_count,
    v_distinct_exercise_count,
    v_minimum_default_sets
  from jsonb_array_elements(p_exercises) as item(value);

  if v_item_count <> v_distinct_exercise_count then
    raise exception 'An exercise cannot appear more than once in a template'
      using errcode = '22023';
  end if;

  if v_minimum_default_sets < 1 then
    raise exception 'Every template exercise requires at least one default set'
      using errcode = '22023';
  end if;

  select count(*)::integer
  into v_valid_exercise_count
  from jsonb_array_elements(p_exercises) as item(value)
  join public.exercises
    on exercises.id =
      ((item.value ->> 'exercise_id')::uuid)
  where (
    exercises.owner_id is null
    or exercises.owner_id = v_user_id
  )
    and exercises.archived_at is null;

  if v_valid_exercise_count <> v_item_count then
    raise exception 'One or more exercises are unavailable'
      using errcode = '22023';
  end if;

  insert into public.workout_templates (
    owner_id,
    name
  )
  values (
    v_user_id,
    btrim(p_template_name)
  )
  returning id into v_template_id;

  insert into public.template_exercises (
    template_id,
    exercise_id,
    position,
    default_sets
  )
  select
    v_template_id,
    ((item.value ->> 'exercise_id')::uuid),
    (item.position - 1)::integer,
    (item.value ->> 'default_sets')::integer
  from jsonb_array_elements(p_exercises)
    with ordinality as item(value, position);

  return v_template_id;
end;
$$;


create function public.update_workout_template(
  p_template_id uuid,
  p_template_name text,
  p_exercises jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_item_count integer;
  v_distinct_exercise_count integer;
  v_minimum_default_sets integer;
  v_valid_exercise_count integer;
begin
  v_user_id := (select auth.uid());

  if v_user_id is null then
    raise exception 'Authentication is required'
      using errcode = '42501';
  end if;

  perform 1
  from public.workout_templates
  where workout_templates.id = p_template_id
    and workout_templates.owner_id = v_user_id
    and workout_templates.archived_at is null;

  if not found then
    raise exception 'Active workout template not found'
      using errcode = '22023';
  end if;

  if p_template_name is null or btrim(p_template_name) = '' then
    raise exception 'Template name is required'
      using errcode = '22023';
  end if;

  if p_exercises is null then
    raise exception 'Exercises are required'
      using errcode = '22023';
  end if;

  if jsonb_typeof(p_exercises) <> 'array' then
    raise exception 'Exercises must be provided as an array'
      using errcode = '22023';
  end if;

  if jsonb_array_length(p_exercises) = 0 then
    raise exception 'A template must contain at least one exercise'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(p_exercises) as item(value)
    where item.value ->> 'exercise_id' is null
       or item.value ->> 'default_sets' is null
  ) then
    raise exception 'Every exercise requires exercise_id and default_sets'
      using errcode = '22023';
  end if;

  select
    count(*)::integer,
    count(
      distinct ((item.value ->> 'exercise_id')::uuid)
    )::integer,
    min((item.value ->> 'default_sets')::integer)
  into
    v_item_count,
    v_distinct_exercise_count,
    v_minimum_default_sets
  from jsonb_array_elements(p_exercises) as item(value);

  if v_item_count <> v_distinct_exercise_count then
    raise exception 'An exercise cannot appear more than once in a template'
      using errcode = '22023';
  end if;

  if v_minimum_default_sets < 1 then
    raise exception 'Every template exercise requires at least one default set'
      using errcode = '22023';
  end if;

  select count(*)::integer
  into v_valid_exercise_count
  from jsonb_array_elements(p_exercises) as item(value)
  join public.exercises
    on exercises.id =
      ((item.value ->> 'exercise_id')::uuid)
  where (
    exercises.owner_id is null
    or exercises.owner_id = v_user_id
  )
    and (
      exercises.archived_at is null
      or exists (
        select 1
        from public.template_exercises as existing_item
        where existing_item.template_id = p_template_id
          and existing_item.exercise_id = exercises.id
      )
    );

  if v_valid_exercise_count <> v_item_count then
    raise exception 'One or more exercises are unavailable'
      using errcode = '22023';
  end if;

  update public.workout_templates
  set
    name = btrim(p_template_name),
    updated_at = now()
  where workout_templates.id = p_template_id
    and workout_templates.owner_id = v_user_id;

  delete from public.template_exercises
  where template_exercises.template_id = p_template_id;

  insert into public.template_exercises (
    template_id,
    exercise_id,
    position,
    default_sets
  )
  select
    p_template_id,
    ((item.value ->> 'exercise_id')::uuid),
    (item.position - 1)::integer,
    (item.value ->> 'default_sets')::integer
  from jsonb_array_elements(p_exercises)
    with ordinality as item(value, position);

  return p_template_id;
end;
$$;


create function public.set_workout_template_archived(
  p_template_id uuid,
  p_archived boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_affected_rows integer;
begin
  v_user_id := (select auth.uid());

  if v_user_id is null then
    raise exception 'Authentication is required'
      using errcode = '42501';
  end if;

  if p_archived is null then
    raise exception 'Archive state is required'
      using errcode = '22023';
  end if;

  update public.workout_templates
  set
    archived_at = case
      when p_archived then coalesce(archived_at, now())
      else null
    end,
    updated_at = now()
  where workout_templates.id = p_template_id
    and workout_templates.owner_id = v_user_id;

  get diagnostics v_affected_rows = row_count;

  if v_affected_rows = 0 then
    raise exception 'Workout template not found'
      using errcode = '22023';
  end if;
end;
$$;


revoke execute
  on function public.create_workout_template(text, jsonb)
  from public;

revoke execute
  on function public.update_workout_template(uuid, text, jsonb)
  from public;

revoke execute
  on function public.set_workout_template_archived(uuid, boolean)
  from public;

grant execute
  on function public.create_workout_template(text, jsonb)
  to authenticated;

grant execute
  on function public.update_workout_template(uuid, text, jsonb)
  to authenticated;

grant execute
  on function public.set_workout_template_archived(uuid, boolean)
  to authenticated;