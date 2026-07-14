import { getSupabaseServerClient } from "../../../../lib/supabase";
import { getCurrentUser } from "../../../../lib/auth";

export const prerender = false;

export async function DELETE({ request, params }) {
  const user = await getCurrentUser(request);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const supabase = getSupabaseServerClient();
  const { id } = params;

  const { data: media, error: fetchError } = await supabase
    .from("media")
    .select("url")
    .eq("id", id)
    .single();

  if (fetchError || !media) {
    return new Response(JSON.stringify({ error: "Media not found" }), { status: 404 });
  }

  const urlParts = media.url.split("/media/");
  if (urlParts.length > 1) {
    const storagePath = urlParts[1];
    await supabase.storage.from("media").remove([`uploads/${storagePath}`]);
  }

  const { error } = await supabase
    .from("media")
    .delete()
    .eq("id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true }));
}
