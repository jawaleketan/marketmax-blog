import { getSupabaseServerClient } from "../../../lib/supabase";
import { getCurrentUser } from "../../../lib/auth";

export const prerender = false;

export async function GET({ request }) {
  const user = await getCurrentUser(request);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ subscribers: data }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function DELETE({ request }) {
  const user = await getCurrentUser(request);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const supabase = getSupabaseServerClient();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(JSON.stringify({ error: "Missing id" }), { status: 400 });
  }

  const { error } = await supabase
    .from("subscribers")
    .delete()
    .eq("id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }));
}
