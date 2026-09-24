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
    btrim(coalesce(new.raw_user_meta_data ->> 'display_name', ''));

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