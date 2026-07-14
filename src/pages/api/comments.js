import { getSupabaseServerClient } from "../../lib/supabase";

export const prerender = false;

function isSpam(body, email) {
  const patterns = [
    /\b(viagra|cialis|casino|lottery|winner|congratulations|click here|buy now)\b/i,
    /https?:\/\/[^\s]+\.(ru|cn|tk|ml|ga|cf)\b/i,
    /(.)\1{10,}/,
  ];
  return patterns.some((p) => p.test(body) || p.test(email || ""));
}

function sanitize(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .trim()
    .slice(0, 2000);
}

export async function GET({ request }) {
  const supabase = getSupabaseServerClient();
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400 });
  }

  const { data, error } = await supabase
    .from("comments")
    .select("id, author_name, body, created_at")
    .eq("slug", slug)
    .eq("approved", true)
    .order("created_at", { ascending: true });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify(data || []), {
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

  const { slug, author_name, author_email, body: commentBody } = body;

  if (!slug || !author_name || !commentBody) {
    return new Response(
      JSON.stringify({ error: "Missing required fields: slug, author_name, body" }),
      { status: 400 }
    );
  }

  if (author_name.length > 100) {
    return new Response(JSON.stringify({ error: "Name too long" }), { status: 400 });
  }

  if (isSpam(commentBody, author_email)) {
    return new Response(
      JSON.stringify({ success: true, message: "Comment submitted for review." }),
      { status: 201 }
    );
  }

  const { error } = await supabase.from("comments").insert({
    slug,
    author_name: sanitize(author_name),
    author_email: author_email ? sanitize(author_email) : null,
    body: sanitize(commentBody),
    approved: false,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(
    JSON.stringify({ success: true, message: "Comment submitted for moderation. It will appear after approval." }),
    { status: 201 }
  );
}
