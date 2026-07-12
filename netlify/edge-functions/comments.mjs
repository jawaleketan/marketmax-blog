import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Simple spam detection
function isSpam(body, authorEmail) {
  const spamPatterns = [
    /\b(viagra|cialis|casino|lottery|winner|congratulations|click here|buy now)\b/i,
    /https?:\/\/[^\s]+\.(ru|cn|tk|ml|ga|cf)\b/i,
    /(.)\1{10,}/,
  ];
  return spamPatterns.some((p) => p.test(body) || p.test(authorEmail || ""));
}

// Basic HTML sanitization
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

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (request.method === "GET") {
    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { data, error } = await supabase
      .from("comments")
      .select("id, author_name, body, created_at")
      .eq("slug", slug)
      .eq("approved", true)
      .order("created_at", { ascending: true });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify(data || []), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  if (request.method === "POST") {
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { slug: bodySlug, author_name, author_email, body: commentBody } = body;

    if (!bodySlug || !author_name || !commentBody) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: slug, author_name, body" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (author_name.length > 100) {
      return new Response(JSON.stringify({ error: "Name too long" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (isSpam(commentBody, author_email)) {
      // Silently reject spam but return success to not tip off spammers
      return new Response(
        JSON.stringify({ success: true, message: "Comment submitted for review." }),
        {
          status: 201,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { error } = await supabase.from("comments").insert({
      slug: bodySlug,
      author_name: sanitize(author_name),
      author_email: author_email ? sanitize(author_email) : null,
      body: sanitize(commentBody),
      approved: false,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Comment submitted for moderation. It will appear after approval.",
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
};

export const config = { path: "/api/comments" };
