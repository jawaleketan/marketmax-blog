const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function supabaseHeaders() {
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
  };
}

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (!supabaseUrl || !supabaseKey) {
    if (request.method === "GET") {
      const url = new URL(request.url);
      const slug = url.searchParams.get("slug");
      if (slug) {
        return new Response(JSON.stringify({ slug, count: 0 }), {
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }
      return new Response(JSON.stringify({}), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }
    return new Response(JSON.stringify({ slug: "", count: 0 }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const url = new URL(request.url);
  let slug = url.searchParams.get("slug");

  // For POST, read slug from body
  if (!slug && request.method === "POST") {
    try {
      const body = await request.json();
      slug = body?.slug;
    } catch {}
  }

  if (!slug) {
    if (request.method === "GET") {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/page_views?select=slug,count&order=count.desc`,
        { headers: supabaseHeaders() }
      );
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
    const res = await fetch(
      `${supabaseUrl}/rest/v1/page_views?slug=eq.${encodeURIComponent(slug)}&select=count`,
      { headers: supabaseHeaders() }
    );
    const data = await res.json();
    const count = data?.[0]?.count || 0;

    return new Response(JSON.stringify({ slug, count }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  if (request.method === "POST") {
    // Try to read existing count
    const readRes = await fetch(
      `${supabaseUrl}/rest/v1/page_views?slug=eq.${encodeURIComponent(slug)}&select=count`,
      { headers: supabaseHeaders() }
    );
    const existing = await readRes.json();
    const currentCount = existing?.[0]?.count || 0;
    const newCount = currentCount + 1;

    let res;
    if (currentCount > 0) {
      // Update existing row
      res = await fetch(
        `${supabaseUrl}/rest/v1/page_views?slug=eq.${encodeURIComponent(slug)}`,
        {
          method: "PATCH",
          headers: {
            ...supabaseHeaders(),
            Prefer: "return=representation",
          },
          body: JSON.stringify({ count: newCount }),
        }
      );
    } else {
      // Insert new row
      res = await fetch(`${supabaseUrl}/rest/v1/page_views`, {
        method: "POST",
        headers: {
          ...supabaseHeaders(),
          Prefer: "return=representation",
        },
        body: JSON.stringify({ slug, count: 1 }),
      });
    }

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ slug, count: newCount }), {
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
};

export const config = {
  runtime: "edge",
};
