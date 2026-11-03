-- =====================================================================
-- FIS website: blog database setup
-- Recorded from the fis-website-dev project on 2026-11-03.
--
-- PURPOSE: rebuilds the blog setup on a NEW, EMPTY Supabase project.
-- DO NOT RUN this on fis-website-dev: everything here already exists
-- there and the run would fail with "already exists" errors.
-- =====================================================================


-- 1. TYPES ------------------------------------------------------------

create type public.user_role as enum ('user', 'publisher', 'admin');

create type public.blog_status as enum ('draft', 'in_review', 'approved', 'published');


-- 2. TABLES -----------------------------------------------------------

create table public.profiles (
  id          uuid        not null,
  email       text        not null,
  full_name   text,
  role        public.user_role not null default 'user',
  created_at  timestamptz not null default now(),
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign key (id) references auth.users (id)
);

create table public.blogs (
  id                uuid        not null default gen_random_uuid(),
  title             text        not null,
  slug              text        not null unique
                    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt           text,
  content           text        not null,
  cover_image_path  text,
  cover_image_alt   text,
  author_name       text        not null,
  author_id         uuid,
  status            public.blog_status not null default 'draft',
  approved_by       uuid,
  approved_at       timestamptz,
  published_at      timestamptz,
  notified_at       timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint blogs_pkey primary key (id),
  constraint blogs_author_id_fkey   foreign key (author_id)   references public.profiles (id),
  constraint blogs_approved_by_fkey foreign key (approved_by) references public.profiles (id)
);


-- 3. FUNCTIONS --------------------------------------------------------

-- Returns the role of the signed-in user (null if nobody is signed in).
create or replace function public.current_role_name()
returns public.user_role
language sql
stable
security definer
set search_path to ''
as $function$
  select role from public.profiles where id = (select auth.uid())
$function$;

-- Creates a profile row automatically when someone signs up.
-- New profiles always get the default role 'user'.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name')
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;

-- Enforces the blog workflow: draft / in_review -> approved (admin only)
-- -> published. Fills in approval and publish details automatically.
create or replace function public.blogs_guard()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
declare
  uid uuid := (select auth.uid());
  r   public.user_role := public.current_role_name();
begin
  new.updated_at := now();

  -- INSERT
  if tg_op = 'INSERT' then
    if new.status not in ('draft', 'in_review') then
      raise exception 'New posts must start as draft or in_review';
    end if;
    if uid is not null then
      new.approved_by  := null;
      new.approved_at  := null;
      new.published_at := null;
      new.notified_at  := null;
    end if;
    return new;
  end if;

  -- UPDATE: signed-in users cannot touch the system-managed columns directly
  if uid is not null then
    new.approved_by  := old.approved_by;
    new.approved_at  := old.approved_at;
    new.published_at := old.published_at;
    new.notified_at  := old.notified_at;
  end if;

  if old.status = 'published' and new.status = 'published' and new.slug <> old.slug then
    raise exception 'Slug cannot be changed after publishing';
  end if;

  -- Status transitions
  if new.status is distinct from old.status then

    if new.status = 'approved' then
      if old.status not in ('draft', 'in_review') then
        raise exception 'Only draft or in_review posts can be approved';
      end if;
      if uid is not null then
        if r is distinct from 'admin' then
          raise exception 'Only admins can approve posts';
        end if;
        new.approved_by := uid;
      end if;
      new.approved_at := now();

    elsif new.status = 'published' then
      if old.status <> 'approved' then
        raise exception 'A post must be approved before it can be published';
      end if;
      new.published_at := coalesce(new.published_at, now());

    else  -- moving to draft or in_review
      if old.status in ('approved', 'published') then
        if uid is not null and r is distinct from 'admin' then
          raise exception 'Only admins can move an approved or published post back';
        end if;
        new.approved_by  := null;
        new.approved_at  := null;
        new.published_at := null;
      end if;
    end if;
  end if;

  return new;
end;
$function$;


-- 4. TRIGGERS ---------------------------------------------------------

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger blogs_guard_trg
  before insert or update on public.blogs
  for each row execute function public.blogs_guard();


-- 5. ROW LEVEL SECURITY (who can see and change what) -----------------

alter table public.profiles enable row level security;
alter table public.blogs    enable row level security;

-- blogs
create policy "blogs: public reads published"
  on public.blogs for select to public
  using (status = 'published');

create policy "blogs: staff read all"
  on public.blogs for select to public
  using (public.current_role_name() in ('admin', 'publisher'));

create policy "blogs: staff insert"
  on public.blogs for insert to public
  with check (public.current_role_name() in ('admin', 'publisher'));

create policy "blogs: staff update"
  on public.blogs for update to public
  using (public.current_role_name() in ('admin', 'publisher'))
  with check (public.current_role_name() in ('admin', 'publisher'));

create policy "blogs: admin delete"
  on public.blogs for delete to public
  using (public.current_role_name() = 'admin');

-- profiles
create policy "profiles: read own or admin"
  on public.profiles for select to public
  using (id = (select auth.uid()) or public.current_role_name() = 'admin');

create policy "profiles: admin updates"
  on public.profiles for update to public
  using (public.current_role_name() = 'admin')
  with check (public.current_role_name() = 'admin');


-- 6. ACCESS GRANTS (lets the website reach the tables; the rules above
--    still decide who gets through) ----------------------------------

revoke truncate, references, trigger on public.blogs    from anon, authenticated;
revoke truncate, references, trigger on public.profiles from anon, authenticated;

grant select on public.blogs to anon;
grant select, insert, update, delete on public.blogs to authenticated;
grant select, update on public.profiles to authenticated;

grant execute on function public.current_role_name() to anon, authenticated;


-- 7. IMAGE STORAGE ----------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'blog-images',
  'blog-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

create policy "blog-images: staff upload"
  on storage.objects for insert to public
  with check (bucket_id = 'blog-images'
              and public.current_role_name() in ('admin', 'publisher'));

create policy "blog-images: staff update"
  on storage.objects for update to public
  using (bucket_id = 'blog-images'
         and public.current_role_name() in ('admin', 'publisher'));

create policy "blog-images: staff delete"
  on storage.objects for delete to public
  using (bucket_id = 'blog-images'
         and public.current_role_name() in ('admin', 'publisher'));
