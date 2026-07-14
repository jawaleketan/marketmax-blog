import { getSupabaseServerClient } from "../../../lib/supabase";
import { getCurrentUser } from "../../../lib/auth";

export const prerender = false;

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function requireAdmin(request) {
  const user = await getCurrentUser(request);
  if (!user) return null;
  return user;
}

export async function GET({ request, url }) {
  const user = await requireAdmin(request);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const supabase = getSupabaseServerClient();
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "20");
  const offset = (page - 1) * limit;

  let query = supabase.from("posts").select("*", { count: "exact" });
  const { data, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  return new Response(JSON.stringify({ posts: data, total: count }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST({ request }) {
  const user = await requireAdmin(request);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const supabase = getSupabaseServerClient();
  let body;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { title, slug, description, content, category, tags, status, image, featured, reading_time, series } = body;

  if (!title || !description || !category) {
    return new Response(JSON.stringify({ error: "Title, description, and category are required" }), { status: 400 });
  }

  const postSlug = slug || generateSlug(title);

  const { data, error } = await supabase
    .from("posts")
    .insert({
      title,
      slug: postSlug,
      description,
      content: content || "",
      category,
      tags: tags || [],
      status: status || "draft",
      image: image || null,
      featured: featured || false,
      reading_time: reading_time || null,
      series: series || null,
      author: "Ketan Jawale",
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return new Response(JSON.stringify({ error: "A post with this slug already exists. Please use a different title." }), { status: 409 });
    }
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ post: data }), { status: 201 });
}
