create table public.profiles (
    id uuid primary key references auth.users (id) on delete cascade,
    display_name text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint profiles_display_name_not_blank
    check (char_length(btrim(display_name)) > 0)
);

alter table public.profiles enable row level security;

revoke all on table public.profiles from anon, authenticated;

grant select
    on table public.profiles
    to authenticated;

grant update (display_name)
    on table public.profiles
    to authenticated;

create policy "profiles_select_own"
    on public.profiles
    for select
    to authenticated
    using ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    profiles_display_name text;
begin
    profiles_display_name :=
        btrim(new.raw_user_meta_data ->> 'display_name');

if profiles_display_name is null or profiles_display_name = '' then
    raise exception 'Name is required';
end if;

insert into public.profiles (id, display_name)
values (new.id, profile_display_name);

return new;
end;
$$;

revoke execute
    on function public.handle_new_user()
    from public;

create trigger on_auth_user_created
    after insert on auth.users
    for each row
    execute function public.handle_new_user();

create function public.handle_profile_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.display_name := btrim(new.display_name);
    new.updated_at := now();

    return new;
end;
$$;

revoke execute
    on function public.handle_profile_update()
    from public;

create trigger on_profile_updated
    before update of display_name on public.profiles
    for each row
    execute function public.handle_profile_update();