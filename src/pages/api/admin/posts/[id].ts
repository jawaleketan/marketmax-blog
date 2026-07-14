import { getSupabaseServerClient } from "../../../../lib/supabase";
import { getCurrentUser } from "../../../../lib/auth";

export const prerender = false;

async function requireAdmin(request) {
  const user = await getCurrentUser(request);
  if (!user) return null;
  return user;
}

export async function GET({ request, params }) {
  const user = await requireAdmin(request);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const supabase = getSupabaseServerClient();
  const { id } = params;

  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return new Response(JSON.stringify({ error: "Post not found" }), { status: 404 });
  }

  return new Response(JSON.stringify({ post: data }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function PUT({ request, params }) {
  const user = await requireAdmin(request);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const supabase = getSupabaseServerClient();
  const { id } = params;
  let body;

  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { title, description, content, category, tags, status, image, featured, reading_time, series } = body;

  const { data, error } = await supabase
    .from("posts")
    .update({
      ...(title && { title }),
      ...(description && { description }),
      ...(content !== undefined && { content }),
      ...(category && { category }),
      ...(tags && { tags }),
      ...(status && { status }),
      ...(image !== undefined && { image }),
      ...(featured !== undefined && { featured }),
      ...(reading_time !== undefined && { reading_time }),
      ...(series !== undefined && { series }),
      updated_at: new Date().toISOString(),
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

export async function DELETE({ request, params }) {
  const user = await requireAdmin(request);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const supabase = getSupabaseServerClient();
  const { id } = params;

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
}
