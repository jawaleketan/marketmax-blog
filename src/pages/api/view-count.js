import { getSupabaseServerClient } from "../../lib/supabase";

export const prerender = false;

export async function GET({ request }) {
  const supabase = getSupabaseServerClient();
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    const { data, error } = await supabase
      .from("page_views")
      .select("slug, count")
      .order("count", { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const counts = {};
    data?.forEach((row) => { counts[row.slug] = row.count; });
    return new Response(JSON.stringify(counts), { headers: { "Content-Type": "application/json" } });
  }

  const { data } = await supabase
    .from("page_views")
    .select("count")
    .eq("slug", slug)
    .single();

  return new Response(JSON.stringify({ slug, count: data?.count || 0 }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST({ request }) {
  const supabase = getSupabaseServerClient();
  let slug;

  try {
    const body = await request.json();
    slug = body?.slug;
  } catch {}

  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400 });
  }

  const { data: existing } = await supabase
    .from("page_views")
    .select("count")
    .eq("slug", slug)
    .single();

  const newCount = (existing?.count || 0) + 1;

  const { error } = await supabase
    .from("page_views")
    .upsert({ slug, count: newCount, updated_at: new Date().toISOString() }, { onConflict: "slug" });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ slug, count: newCount }), {
    headers: { "Content-Type": "application/json" },
  });
}
