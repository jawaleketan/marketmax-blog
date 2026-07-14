import { getSupabaseServerClient } from "../../lib/supabase";

export const prerender = false;

const VALID_TYPES = ["like", "helpful", "insightful"];

export async function GET({ request }) {
  const supabase = getSupabaseServerClient();
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400 });
  }

  const { data, error } = await supabase
    .from("reactions")
    .select("type")
    .eq("slug", slug);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const counts = { like: 0, helpful: 0, insightful: 0 };
  data?.forEach((r) => {
    if (counts[r.type] !== undefined) counts[r.type]++;
  });

  return new Response(JSON.stringify(counts), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST({ request }) {
  const supabase = getSupabaseServerClient();
  let body;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { type, fingerprint, slug } = body;

  if (!slug || !type || !fingerprint) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: slug, type, fingerprint" }),
      { status: 400 }
    );
  }

  if (!VALID_TYPES.includes(type)) {
    return new Response(
      JSON.stringify({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` }),
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("reactions")
    .select("id")
    .eq("slug", slug)
    .eq("type", type)
    .eq("fingerprint", fingerprint)
    .limit(1);

  if (existing && existing.length > 0) {
    await supabase.from("reactions").delete().eq("id", existing[0].id);
    return new Response(JSON.stringify({ toggled: "removed", type }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error } = await supabase.from("reactions").insert({ slug, type, fingerprint });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ toggled: "added", type }), {
    status: 201,
    headers: { "Content-Type": "application/json" },
  });
}
