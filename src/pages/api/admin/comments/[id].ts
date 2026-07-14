import { getSupabaseServerClient } from "../../../../lib/supabase";
import { getCurrentUser } from "../../../../lib/auth";

export const prerender = false;

export async function PUT({ request, params }) {
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

  const { error } = await supabase
    .from("comments")
    .update({ approved: body.approved })
    .eq("id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }));
}

export async function DELETE({ request, params }) {
  const user = await getCurrentUser(request);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const supabase = getSupabaseServerClient();
  const { id } = params;

  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }));
}
