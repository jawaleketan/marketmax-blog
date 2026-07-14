import { getSupabaseServerClient } from "../../../../lib/supabase";
import { getCurrentUser } from "../../../../lib/auth";

export const prerender = false;

export async function POST({ request }) {
  const user = await getCurrentUser(request);
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file === "string") {
    return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });
  }

  const supabase = getSupabaseServerClient();
  const fileExt = file.name.split(".").pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
  const filePath = `uploads/${fileName}`;

  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);

  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(filePath, uint8Array, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    return new Response(JSON.stringify({ error: uploadError.message }), { status: 500 });
  }

  const { data: urlData } = supabase.storage.from("media").getPublicUrl(filePath);

  const { error: dbError } = await supabase.from("media").insert({
    filename: file.name,
    url: urlData.publicUrl,
    alt_text: "",
    file_size: file.size,
    mime_type: file.type,
    uploaded_by: user.id,
  });

  if (dbError) {
    return new Response(JSON.stringify({ error: dbError.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, url: urlData.publicUrl }), { status: 201 });
}
