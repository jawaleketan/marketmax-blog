import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const VALID_TYPES = ["like", "helpful", "insightful"];

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
      .from("reactions")
      .select("type")
      .eq("slug", slug);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const counts = { like: 0, helpful: 0, insightful: 0 };
    data?.forEach((r) => {
      if (counts[r.type] !== undefined) counts[r.type]++;
    });

    return new Response(JSON.stringify(counts), {
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

    const { type, fingerprint, slug: bodySlug } = body;

    if (!bodySlug || !type || !fingerprint) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: slug, type, fingerprint" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return new Response(
        JSON.stringify({ error: `Invalid type. Must be one of: ${VALID_TYPES.join(", ")}` }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (fingerprint.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid fingerprint" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if user already reacted with this type on this post
    const { data: existing } = await supabase
      .from("reactions")
      .select("id")
      .eq("slug", bodySlug)
      .eq("type", type)
      .eq("fingerprint", fingerprint)
      .single();

    if (existing) {
      // Toggle off — remove reaction
      const { error } = await supabase
        .from("reactions")
        .delete()
        .eq("id", existing.id);

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      return new Response(JSON.stringify({ toggled: "removed", type }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Add reaction
    const { error } = await supabase.from("reactions").insert({
      slug: bodySlug,
      type,
      fingerprint,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ toggled: "added", type }), {
      status: 201,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
};

export const config = { path: "/api/reactions" };
