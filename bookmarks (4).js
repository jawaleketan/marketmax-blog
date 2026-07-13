# MarketMax Blog — Database Features

## Overview

This project uses **Supabase** (PostgreSQL) for all database features:

- **View Counts** — Atomic page view tracking per article
- **Comments** — User comments with moderation workflow
- **Reactions** — Like / Helpful / Insightful toggle buttons
- **Bookmarks** — Save posts to your account (requires Netlify Identity)
- **Subscribers** — Newsletter subscriber management

## Setup

See `supabase/SETUP.md` for full setup instructions.

Quick version:
1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Run `supabase/rls-policies.sql` in the SQL Editor
4. Set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Netlify environment variables
5. Deploy

## Files

```
supabase/
  schema.sql          — Database tables and functions
  rls-policies.sql    — Row Level Security policies
  SETUP.md            — Full setup guide

netlify/
  edge-functions/
    view-count.mjs    — GET/POST /api/view-count
    comments.mjs      — GET/POST /api/comments
    reactions.mjs     — GET/POST /api/reactions
    bookmarks.mjs     — GET/POST/DELETE /api/bookmarks
    subscribers.mjs   — GET/POST /api/subscribers

src/
  lib/
    supabase.ts       — Supabase client (for build-time use)
    supabase-types.ts — TypeScript types for database tables
  components/
    Comments.astro    — Comments form and list
    Reactions.astro   — Like/Helpful/Insightful buttons
    BookmarkBtn.astro — Save/bookmark post button
```

## API Endpoints

| Endpoint | Methods | Auth | Description |
|----------|---------|------|-------------|
| `/api/view-count` | GET, POST | No | Read/increment view counts |
| `/api/comments` | GET, POST | No | Read comments / submit new (moderated) |
| `/api/reactions` | GET, POST | No | Read counts / toggle reaction |
| `/api/bookmarks` | GET, POST, DELETE | Yes | Manage saved posts |
| `/api/subscribers` | GET, POST | No | Newsletter subscriber list / subscribe |

## Moderation

Comments are **not public by default**. To approve:
1. Go to Supabase Dashboard → Table Editor → comments
2. Set `approved` to `true` for approved comments
