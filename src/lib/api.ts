import { supabase } from "@/integrations/supabase/client";

export type FeedPost = {
  id: string;
  author_id: string;
  content: string | null;
  media_url: string | null;
  media_type: string | null;
  visibility: "public" | "followers" | "private";
  created_at: string;
  author: {
    id: string;
    username: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  reactions: { kind: ReactionKind; user_id: string }[];
  comment_count: number;
  is_bookmarked?: boolean;
};

export type ReactionKind = "like" | "love" | "haha" | "wow" | "sad" | "angry";

export async function fetchFeed(filter: "for-you" | "following", userId: string | null): Promise<FeedPost[]> {
  let query = supabase
    .from("posts")
    .select(
      `id, author_id, content, media_url, media_type, visibility, created_at,
       author:profiles!posts_author_id_fkey(id, username, full_name, avatar_url),
       reactions(kind, user_id),
       comments(count)`
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (filter === "following" && userId) {
    const { data: follows } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", userId);
    const ids = (follows ?? []).map((f) => f.following_id);
    if (ids.length === 0) return [];
    query = query.in("author_id", ids);
  }

  const { data, error } = await query;
  if (error) throw error;

  let bookmarked = new Set<string>();
  if (userId) {
    const { data: bm } = await supabase.from("bookmarks").select("post_id").eq("user_id", userId);
    bookmarked = new Set((bm ?? []).map((b) => b.post_id));
  }

  return (data ?? []).map((row: any) => ({
    ...row,
    comment_count: row.comments?.[0]?.count ?? 0,
    is_bookmarked: bookmarked.has(row.id),
  }));
}

export async function fetchPostById(postId: string): Promise<FeedPost | null> {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `id, author_id, content, media_url, media_type, visibility, created_at,
       author:profiles!posts_author_id_fkey(id, username, full_name, avatar_url),
       reactions(kind, user_id),
       comments(count)`
    )
    .eq("id", postId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return { ...(data as any), comment_count: (data as any).comments?.[0]?.count ?? 0 };
}

export async function createPost(args: {
  authorId: string;
  content: string;
  visibility: "public" | "followers" | "private";
  file?: File | null;
}) {
  let media_url: string | null = null;
  let media_type: string | null = null;
  if (args.file) {
    const ext = args.file.name.split(".").pop() ?? "bin";
    const path = `${args.authorId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("post-media").upload(path, args.file);
    if (upErr) throw upErr;
    media_url = supabase.storage.from("post-media").getPublicUrl(path).data.publicUrl;
    media_type = args.file.type.startsWith("video") ? "video" : "image";
  }
  const { error } = await supabase.from("posts").insert({
    author_id: args.authorId,
    content: args.content,
    visibility: args.visibility,
    media_url,
    media_type,
  });
  if (error) throw error;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

export async function setReaction(postId: string, userId: string, kind: ReactionKind | null) {
  if (kind === null) {
    await supabase.from("reactions").delete().eq("post_id", postId).eq("user_id", userId);
    return;
  }
  await supabase
    .from("reactions")
    .upsert({ post_id: postId, user_id: userId, kind }, { onConflict: "post_id,user_id" });
}

export async function toggleBookmark(postId: string, userId: string, isOn: boolean) {
  if (isOn) await supabase.from("bookmarks").delete().eq("post_id", postId).eq("user_id", userId);
  else await supabase.from("bookmarks").insert({ post_id: postId, user_id: userId });
}

export async function fetchComments(postId: string) {
  const { data, error } = await supabase
    .from("comments")
    .select(`id, content, parent_id, created_at, user_id,
      author:profiles!comments_user_id_fkey(id, username, full_name, avatar_url)`)
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function addComment(args: { postId: string; userId: string; content: string; parentId?: string | null }) {
  const { error } = await supabase.from("comments").insert({
    post_id: args.postId,
    user_id: args.userId,
    content: args.content,
    parent_id: args.parentId ?? null,
  });
  if (error) throw error;
}

export async function toggleFollow(followerId: string, followingId: string, isFollowing: boolean) {
  if (isFollowing) {
    await supabase.from("follows").delete().eq("follower_id", followerId).eq("following_id", followingId);
  } else {
    await supabase.from("follows").insert({ follower_id: followerId, following_id: followingId });
  }
}

export async function fetchProfile(username: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, cover_url, bio, website, location, created_at")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, patch: {
  full_name?: string | null;
  username?: string;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
}) {
  const { error } = await supabase.from("profiles").update(patch).eq("id", userId);
  if (error) throw error;
}

export async function uploadCover(userId: string, file: File) {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/cover.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}

export async function fetchUserPosts(userId: string) {
  const { data, error } = await supabase
    .from("posts")
    .select(
      `id, author_id, content, media_url, media_type, visibility, created_at,
       author:profiles!posts_author_id_fkey(id, username, full_name, avatar_url),
       reactions(kind, user_id),
       comments(count)`
    )
    .eq("author_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row: any) => ({ ...row, comment_count: row.comments?.[0]?.count ?? 0 })) as FeedPost[];
}

export async function searchAll(q: string) {
  if (!q.trim()) return { profiles: [], posts: [] };
  const like = `%${q}%`;
  const [{ data: profiles }, { data: posts }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url, bio")
      .or(`username.ilike.${like},full_name.ilike.${like}`)
      .limit(20),
    supabase
      .from("posts")
      .select(`id, author_id, content, created_at,
        author:profiles!posts_author_id_fkey(id, username, full_name, avatar_url)`)
      .ilike("content", like)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);
  return { profiles: profiles ?? [], posts: posts ?? [] };
}

export async function fetchNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select(`id, kind, post_id, read, created_at,
      actor:profiles!notifications_actor_id_fkey(id, username, full_name, avatar_url)`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}

export async function markNotificationsRead(userId: string) {
  await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
}

export async function markStoryViewed(storyId: string, viewerId: string) {
  await supabase.from("story_views").upsert(
    { story_id: storyId, viewer_id: viewerId },
    { onConflict: "story_id,viewer_id" }
  );
}

export async function fetchStoryViewedIds(viewerId: string) {
  const { data } = await supabase.from("story_views").select("story_id").eq("viewer_id", viewerId);
  return new Set((data ?? []).map((r) => r.story_id));
}

export async function fetchProfileStats(profileId: string, viewerId: string | null) {
  const [{ count: followers }, { count: following }, { count: posts }, follow] = await Promise.all([
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profileId),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profileId),
    supabase.from("posts").select("*", { count: "exact", head: true }).eq("author_id", profileId),
    viewerId
      ? supabase.from("follows").select("*", { head: true, count: "exact" }).eq("follower_id", viewerId).eq("following_id", profileId)
      : Promise.resolve({ count: 0 } as any),
  ]);
  return {
    followers: followers ?? 0,
    following: following ?? 0,
    posts: posts ?? 0,
    isFollowing: (follow as any).count > 0,
  };
}

export async function fetchSuggestedUsers(viewerId: string | null, limit = 5) {
  let q = supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, bio")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (viewerId) q = q.neq("id", viewerId);
  const { data } = await q;
  return data ?? [];
}

export async function fetchStories() {
  const { data, error } = await supabase
    .from("stories")
    .select(`id, content, media_url, background, created_at, author_id,
      author:profiles!stories_author_id_fkey(id, username, full_name, avatar_url)`)
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createStory(args: {
  authorId: string;
  content?: string;
  background?: string;
  file?: File | null;
}) {
  let media_url: string | null = null;
  if (args.file) {
    const ext = args.file.name.split(".").pop() ?? "bin";
    const path = `${args.authorId}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("story-media").upload(path, args.file);
    if (upErr) throw upErr;
    media_url = supabase.storage.from("story-media").getPublicUrl(path).data.publicUrl;
  }
  const { error } = await supabase.from("stories").insert({
    author_id: args.authorId,
    content: args.content ?? null,
    background: args.background ?? null,
    media_url,
  });
  if (error) throw error;
}

export async function uploadAvatar(userId: string, file: File) {
  const ext = file.name.split(".").pop() ?? "png";
  const path = `${userId}/avatar.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
}

export function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString();
}