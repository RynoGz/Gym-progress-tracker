create table public.exercises (
  id uuid primary key default gen_random_uuid(),

  owner_id uuid
    default auth.uid()
    references auth.users (id)
    on delete cascade,

  name text not null,

  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint exercises_name_not_blank
    check (char_length(btrim(name)) > 0)
);

alter table public.exercises enable row level security;

revoke all
  on table public.exercises
  from anon, authenticated;

grant select
  on table public.exercises
  to authenticated;

grant insert (name)
  on table public.exercises
  to authenticated;

grant update (name, archived_at)
  on table public.exercises
  to authenticated;

create policy "exercises_select_available"
  on public.exercises
  for select
  to authenticated
  using (
    owner_id is null
    or owner_id = (select auth.uid())
  );

create policy "exercises_insert_own"
  on public.exercises
  for insert
  to authenticated
  with check (
    owner_id = (select auth.uid())
    and archived_at is null
  );

create policy "exercises_update_own"
  on public.exercises
  for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create function public.handle_exercise_write()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.name := btrim(new.name);

  if tg_op = 'UPDATE' then
    new.updated_at := now();
  end if;

  return new;
end;
$$;

revoke execute
  on function public.handle_exercise_write()
  from public;

create trigger on_exercise_written
  before insert or update of name, archived_at
  on public.exercises
  for each row
  execute function public.handle_exercise_write();