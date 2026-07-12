import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    // Return all view counts (for popular posts sidebar)
    if (request.method === "GET") {
      const { data, error } = await supabase
        .from("page_views")
        .select("slug, count")
        .order("count", { ascending: false });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      const counts = {};
      data?.forEach((row) => {
        counts[row.slug] = row.count;
      });

      return new Response(JSON.stringify(counts), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
  }

  if (request.method === "GET") {
    const { data } = await supabase
      .from("page_views")
      .select("count")
      .eq("slug", slug)
      .single();

    return new Response(
      JSON.stringify({ slug, count: data?.count || 0 }),
      {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  if (request.method === "POST") {
    const { data, error } = await supabase.rpc("increment_view_count", {
      p_slug: slug,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ slug, count: data || 0 }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
};

export const config = { path: "/api/view-count" };
