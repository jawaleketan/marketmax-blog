import { getSupabaseServerClient } from "../../../../../lib/supabase";
import { getCurrentUser } from "../../../../../lib/auth";

export const prerender = false;

export async function POST({ request, params }) {
  const user = await getCurrentUser(request);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const supabase = getSupabaseServerClient();
  const { id } = params;
  let body;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { status } = body;

  if (!status || !["draft", "published"].includes(status)) {
    return new Response(JSON.stringify({ error: "Invalid status. Must be 'draft' or 'published'" }), { status: 400 });
  }

  const { data, error } = await supabase
    .from("posts")
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...(status === "published" && { publish_date: new Date().toISOString() }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ post: data }), {
    headers: { "Content-Type": "application/json" },
  });
}
