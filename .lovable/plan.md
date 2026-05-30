# Lumera — Build Plan

A full Facebook-style social platform with realtime feed, chat, and WebRTC calls is a multi-week scope. I'll build it on **Lovable Cloud** (Supabase under the hood) in phases so you can validate each layer before moving on. Each phase ends in a working, shippable state.

## Phase 1 — Foundation (Auth + Profiles + Design System)
- Enable Lovable Cloud
- Design system in `src/styles.css` (modern social UI, light + dark)
- Email/password auth (login, register, logout, protected routes)
- `profiles` table + auto-create trigger on signup
- Profile page (view/edit avatar, bio, username)
- Storage bucket: `avatars`

## Phase 2 — Posts + Feed
- `posts` table with RLS (privacy: public/followers/private)
- Create / edit / delete posts with image/video upload (`post-media` bucket)
- Home feed (latest first) with realtime subscription
- Single post view

## Phase 3 — Social Graph + Engagement
- `follows` table (follow/unfollow, follower counts)
- Feed filter: "Following" vs "Discover"
- `reactions` table (like/love/haha/wow/sad/angry, one per user/post) — realtime
- `comments` table with nested replies, edit/delete — realtime

## Phase 4 — Chat
- `conversations` + `messages` tables, RLS scoped to participants
- 1-to-1 chat UI with realtime messages
- Read receipts + typing indicator
- `chat-media` bucket for attachments

## Phase 5 — Notifications
- `notifications` table (likes, comments, follows, messages, calls)
- Realtime bell with unread badge

## Phase 6 — WebRTC Calls (1-to-1 voice + video)
- `calls` table for call state
- Signaling over Supabase Realtime channels (offer/answer/ICE)
- Google STUN by default; optional TURN via secrets (`TURN_URL`, `TURN_USERNAME`, `TURN_PASSWORD`)
- Call UI: incoming popup, accept/reject, mute, camera toggle, end call

## Technical notes
- **Stack**: TanStack Start (project default) + Lovable Cloud + Tailwind v4. Not Next.js — Lovable's template is TanStack Start; functionally equivalent for this app.
- **Roles**: separate `user_roles` table + `has_role()` security-definer function (avoids RLS recursion).
- **RLS**: enabled on every table from day one with explicit GRANTs.
- **Realtime**: Supabase Realtime channels for feed, reactions, comments, chat, calls.
- **WebRTC**: peer-to-peer; TURN is optional and added in Phase 6 only if you provide a server.

## What I need from you before starting
1. **Confirm phased delivery** — I'll start with Phase 1 now and continue phase-by-phase, or you can ask me to push further in one go (Phases 1–3 in a single pass is realistic; Phases 4–6 each warrant their own pass).
2. **Visual direction** — any brand color / vibe preference (e.g. "Instagram-warm", "Linear-minimal dark", "Discord-playful"), or should I pick a modern dark-first palette?
3. **TURN server** — skip for now (STUN-only, works on most networks) or do you already have a coturn server?

Reply with answers (or just "go") and I'll start Phase 1.