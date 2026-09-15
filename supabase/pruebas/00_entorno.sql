-- Reproduce lo justo del entorno de Supabase para poder probar la migracion:
-- el esquema auth, la tabla users, auth.uid() y los roles anon/authenticated.
create extension if not exists pgcrypto;

create schema if not exists auth;

create table if not exists auth.users (
  id                  uuid primary key default gen_random_uuid(),
  email               text unique,
  email_confirmed_at  timestamptz,
  raw_user_meta_data  jsonb not null default '{}'::jsonb,
  created_at          timestamptz not null default now()
);

-- Misma implementacion que usa Supabase: lee el `sub` del JWT que PostgREST
-- deja en la configuracion de la sesion.
create or replace function auth.uid() returns uuid
language sql stable
as $$
  select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
$$;

do $$ begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin;
  end if;
end $$;

grant usage on schema auth to anon, authenticated;
