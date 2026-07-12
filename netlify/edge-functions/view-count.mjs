const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function supabaseRest(path, options = {}) {
  const url = `${supabaseUrl}/rest/v1/${path}`;
  return fetch(url, {
    ...options,
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...options.headers,
    },
  });
}

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");

  if (!slug) {
    if (request.method === "GET") {
      const res = await supabaseRest("page_views?select=slug,count&order=count.desc");
      const data = await res.json();

      if (!res.ok) {
        return new Response(JSON.stringify({ error: data.message }), {
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
    const res = await supabaseRest(`page_views?slug=eq.${encodeURIComponent(slug)}&select=count`);
    const data = await res.json();
    const count = data?.[0]?.count || 0;

    return new Response(JSON.stringify({ slug, count }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  if (request.method === "POST") {
    // Use RPC to call the atomic increment function
    const res = await supabaseRest("rpc/increment_view_count", {
      method: "POST",
      body: JSON.stringify({ p_slug: slug }),
    });
    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.message || data }), {
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
