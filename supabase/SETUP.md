# Database Setup Guide

## Quick Start (5 minutes)

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up (free tier)
2. Click **New Project**
3. Choose a name (e.g. `marketmax-blog`)
4. Set a strong database password
5. Choose a region close to your audience
6. Click **Create new project**

### 2. Run Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Copy the contents of `supabase/schema.sql` and paste it
4. Click **Run** (or press Ctrl+Enter)
5. Repeat with `supabase/rls-policies.sql`

### 3. Get API Keys
1. Go to **Project Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like `https://xyz.supabase.co`)
   - **anon public** key (long `eyJ...` string)
   - **service_role** key (for admin operations only)

### 4. Set Environment Variables
In **Netlify Dashboard** → **Site** → **Environment variables**:

```
SUPABASE_URL = https://xyz.supabase.co
SUPABASE_ANON_KEY = eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGci...
```

For local development, create a `.env` file in the project root:
```
SUPABASE_URL = https://xyz.supabase.co
SUPABASE_ANON_KEY = eyJhbGci...
```

### 5. Deploy
```bash
git add .
git commit -m "feat: add database features (comments, reactions, bookmarks)"
git push origin main
```

Netlify will automatically deploy and the edge functions will start working.

---

## What Gets Created

### Tables
| Table | Purpose |
|-------|---------|
| `page_views` | Track article view counts (atomic increment) |
| `comments` | User comments with moderation |
| `reactions` | Like / Helpful / Insightful toggle buttons |
| `subscribers` | Newsletter subscriber list |
| `bookmarks` | Saved posts per user |

### API Endpoints
| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/view-count` | GET, POST | Read/increment view counts |
| `/api/comments` | GET, POST | Read/submit comments |
| `/api/reactions` | GET, POST | Read/toggle reactions |
| `/api/bookmarks` | GET, POST, DELETE | Manage saved posts (auth required) |
| `/api/subscribers` | GET, POST | Newsletter subscriber management |

---

## Moderating Comments

Comments require approval before appearing publicly. To moderate:

1. Go to **Supabase Dashboard** → **Table Editor** → **comments**
2. Find the comment you want to approve
3. Change the `approved` column from `false` to `true`
4. Save

Or run this SQL:
```sql
-- Approve a specific comment
UPDATE comments SET approved = true WHERE id = 'comment-uuid';

-- Approve all pending comments
UPDATE comments SET approved = true WHERE approved = false;
```

---

## Migrating Existing Blobs Data

If you have existing view counts in Netlify Blobs and want to migrate them:

### Option A: Manual Export
1. Call `GET /api/view-count` (old Blobs function) to get all counts
2. Run this SQL in Supabase:
```sql
INSERT INTO page_views (slug, count) VALUES
  ('your-post-slug', 42),
  ('another-post', 15)
ON CONFLICT (slug) DO UPDATE SET count = EXCLUDED.count;
```

### Option B: Script
```js
// migrate-blobs.mjs
import { getStore } from "@netlify/blobs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const store = getStore("view-counts");

async function migrate() {
  const all = await store.list();
  for (const key of all.blobs) {
    const raw = await store.get(key);
    const count = raw ? parseInt(raw, 10) : 0;
    await supabase.from("page_views").upsert({ slug: key, count });
    console.log(`Migrated: ${key} = ${count}`);
  }
  console.log("Done!");
}

migrate();
```

---

## Troubleshooting

### "Failed to fetch" errors
- Check that `SUPABASE_URL` and `SUPABASE_ANON_KEY` are set correctly in Netlify
- Make sure the edge functions are deployed (check Netlify Functions tab)

### Comments not appearing
- Comments require moderation by default. Check the `approved` column in Supabase Table Editor.

### Reactions showing 0
- Reactions use browser fingerprinting (localStorage). Clearing browser data will reset the fingerprint.

### Bookmarks not working
- Bookmarks require Netlify Identity. Make sure Identity is enabled in Netlify Dashboard → Identity → Enable.

---

## Cost

Supabase free tier includes:
- 500 MB database
- 50,000 monthly active users
- 1 GB file storage
- 2 million edge function invocations

This blog's usage will be well within free tier limits.
