import { getSupabaseServerClient } from "../../lib/supabase";

export const prerender = false;

export async function GET({ request }) {
  const supabase = getSupabaseServerClient();
  const url = new URL(request.url);

  const authHeader = request.headers.get("Authorization");
  let userId = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.sub || payload.email;
    } catch {}
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .select("slug, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data || []), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST({ request }) {
  const supabase = getSupabaseServerClient();

  const authHeader = request.headers.get("Authorization");
  let userId = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.sub || payload.email;
    } catch {}
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { slug } = body;
  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400 });
  }

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("id")
    .eq("user_id", userId)
    .eq("slug", slug)
    .limit(1);

  if (existing && existing.length > 0) {
    await supabase.from("bookmarks").delete().eq("id", existing[0].id);
    return new Response(JSON.stringify({ bookmarked: false, slug }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error } = await supabase.from("bookmarks").insert({ user_id: userId, slug });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ bookmarked: true, slug }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE({ request }) {
  const supabase = getSupabaseServerClient();
  const url = new URL(request.url);

  const authHeader = request.headers.get("Authorization");
  let userId = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.sub || payload.email;
    } catch {}
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
  }

  const slug = url.searchParams.get("slug");
  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400 });
  }

  const { error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("user_id", userId)
    .eq("slug", slug);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ bookmarked: false, slug }), {
    headers: { "Content-Type": "application/json" },
  });
}
