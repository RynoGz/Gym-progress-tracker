-- Reinstall the corrected trigger function.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_display_name text;
begin
  requested_display_name :=
    btrim(
      coalesce(
        new.raw_user_meta_data ->> 'display_name',
        ''
      )
    );

  if requested_display_name = '' then
    raise exception 'Display name is required';
  end if;

  insert into public.profiles (
    id,
    display_name
  )
  values (
    new.id,
    requested_display_name
  );

  return new;
end;
$$;

-- The Auth service can invoke the function through the trigger,
-- but application roles do not need permission to call it directly.
revoke execute
  on function public.handle_new_user()
  from public, anon, authenticated;

-- Recreate the trigger so we know it points to the corrected function.
drop trigger if exists on_auth_user_created
  on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Repair existing Auth users that are missing profile rows.
-- Only users with a valid display_name are included.
insert into public.profiles (
  id,
  display_name
)
select
  auth_user.id,
  btrim(
    auth_user.raw_user_meta_data ->> 'display_name'
  )
from auth.users as auth_user
where not exists (
  select 1
  from public.profiles as existing_profile
  where existing_profile.id = auth_user.id
)
and nullif(
  btrim(
    coalesce(
      auth_user.raw_user_meta_data ->> 'display_name',
      ''
    )
  ),
  ''
) is not null
on conflict (id) do nothing;