
-- PROFILES
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  full_name text,
  avatar_url text,
  cover_url text,
  bio text,
  website text,
  created_at timestamptz not null default now()
);
grant select on public.profiles to anon, authenticated;
grant insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- FOLLOWS (created before posts so the posts policy can reference it)
create table public.follows (
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);
grant select on public.follows to anon, authenticated;
grant insert, delete on public.follows to authenticated;
grant all on public.follows to service_role;
alter table public.follows enable row level security;
create policy "follows_select_all" on public.follows for select using (true);
create policy "follows_insert_own" on public.follows for insert to authenticated with check (follower_id = auth.uid());
create policy "follows_delete_own" on public.follows for delete to authenticated using (follower_id = auth.uid());

-- POSTS
create type public.post_visibility as enum ('public', 'followers', 'private');
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  media_url text,
  media_type text,
  visibility public.post_visibility not null default 'public',
  created_at timestamptz not null default now()
);
grant select on public.posts to anon, authenticated;
grant insert, update, delete on public.posts to authenticated;
grant all on public.posts to service_role;
alter table public.posts enable row level security;
create policy "posts_select_visible" on public.posts for select using (
  visibility = 'public'
  or author_id = auth.uid()
  or (visibility = 'followers' and exists (
    select 1 from public.follows f where f.following_id = posts.author_id and f.follower_id = auth.uid()
  ))
);
create policy "posts_insert_own" on public.posts for insert to authenticated with check (author_id = auth.uid());
create policy "posts_update_own" on public.posts for update to authenticated using (author_id = auth.uid());
create policy "posts_delete_own" on public.posts for delete to authenticated using (author_id = auth.uid());
create index posts_author_created_idx on public.posts (author_id, created_at desc);
create index posts_created_idx on public.posts (created_at desc);

-- STORIES
create table public.stories (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  media_url text,
  background text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);
grant select on public.stories to anon, authenticated;
grant insert, update, delete on public.stories to authenticated;
grant all on public.stories to service_role;
alter table public.stories enable row level security;
create policy "stories_select_active" on public.stories for select using (expires_at > now());
create policy "stories_insert_own" on public.stories for insert to authenticated with check (author_id = auth.uid());
create policy "stories_delete_own" on public.stories for delete to authenticated using (author_id = auth.uid());
create index stories_author_idx on public.stories (author_id, created_at desc);

-- REACTIONS
create type public.reaction_kind as enum ('like','love','haha','wow','sad','angry');
create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  kind public.reaction_kind not null,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);
grant select on public.reactions to anon, authenticated;
grant insert, update, delete on public.reactions to authenticated;
grant all on public.reactions to service_role;
alter table public.reactions enable row level security;
create policy "reactions_select_all" on public.reactions for select using (true);
create policy "reactions_insert_own" on public.reactions for insert to authenticated with check (user_id = auth.uid());
create policy "reactions_update_own" on public.reactions for update to authenticated using (user_id = auth.uid());
create policy "reactions_delete_own" on public.reactions for delete to authenticated using (user_id = auth.uid());
create index reactions_post_idx on public.reactions (post_id);

-- COMMENTS
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);
grant select on public.comments to anon, authenticated;
grant insert, update, delete on public.comments to authenticated;
grant all on public.comments to service_role;
alter table public.comments enable row level security;
create policy "comments_select_all" on public.comments for select using (true);
create policy "comments_insert_own" on public.comments for insert to authenticated with check (user_id = auth.uid());
create policy "comments_update_own" on public.comments for update to authenticated using (user_id = auth.uid());
create policy "comments_delete_own" on public.comments for delete to authenticated using (user_id = auth.uid());
create index comments_post_idx on public.comments (post_id, created_at);

-- BOOKMARKS
create table public.bookmarks (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, post_id)
);
grant select, insert, delete on public.bookmarks to authenticated;
grant all on public.bookmarks to service_role;
alter table public.bookmarks enable row level security;
create policy "bookmarks_select_own" on public.bookmarks for select to authenticated using (user_id = auth.uid());
create policy "bookmarks_insert_own" on public.bookmarks for insert to authenticated with check (user_id = auth.uid());
create policy "bookmarks_delete_own" on public.bookmarks for delete to authenticated using (user_id = auth.uid());

-- STORY VIEWS
create table public.story_views (
  story_id uuid not null references public.stories(id) on delete cascade,
  viewer_id uuid not null references public.profiles(id) on delete cascade,
  viewed_at timestamptz not null default now(),
  primary key (story_id, viewer_id)
);
grant select, insert on public.story_views to authenticated;
grant all on public.story_views to service_role;
alter table public.story_views enable row level security;
create policy "story_views_select_author_or_self" on public.story_views for select to authenticated using (
  viewer_id = auth.uid() or exists (select 1 from public.stories s where s.id = story_id and s.author_id = auth.uid())
);
create policy "story_views_insert_own" on public.story_views for insert to authenticated with check (viewer_id = auth.uid());

-- NOTIFICATIONS
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete cascade,
  kind text not null,
  post_id uuid references public.posts(id) on delete cascade,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select, update on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "notifications_select_own" on public.notifications for select to authenticated using (user_id = auth.uid());
create policy "notifications_update_own" on public.notifications for update to authenticated using (user_id = auth.uid());

-- STORAGE
insert into storage.buckets (id, name, public) values
  ('avatars','avatars',true),
  ('post-media','post-media',true),
  ('story-media','story-media',true)
on conflict (id) do nothing;

create policy "avatars_public_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_owner_write" on storage.objects for insert to authenticated with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_owner_update" on storage.objects for update to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_owner_delete" on storage.objects for delete to authenticated using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "postmedia_public_read" on storage.objects for select using (bucket_id = 'post-media');
create policy "postmedia_owner_write" on storage.objects for insert to authenticated with check (bucket_id = 'post-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "postmedia_owner_delete" on storage.objects for delete to authenticated using (bucket_id = 'post-media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "storymedia_public_read" on storage.objects for select using (bucket_id = 'story-media');
create policy "storymedia_owner_write" on storage.objects for insert to authenticated with check (bucket_id = 'story-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "storymedia_owner_delete" on storage.objects for delete to authenticated using (bucket_id = 'story-media' and (storage.foldername(name))[1] = auth.uid()::text);

-- REALTIME
alter publication supabase_realtime add table public.posts;
alter publication supabase_realtime add table public.reactions;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.stories;
alter publication supabase_realtime add table public.notifications;
