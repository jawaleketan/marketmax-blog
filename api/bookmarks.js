const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
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

  if (!supabaseUrl || !supabaseKey) {
    return new Response(JSON.stringify({ error: "Service unavailable locally" }), {
      status: 503,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  // Get user from Netlify Identity JWT
  const authHeader = request.headers.get("Authorization");
  let userId = null;

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.sub || payload.email;
    } catch {
      // Invalid token
    }
  }

  if (!userId) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  const url = new URL(request.url);

  if (request.method === "GET") {
    const res = await supabaseRest(
      `bookmarks?user_id=eq.${encodeURIComponent(userId)}&select=slug,created_at&order=created_at.desc`
    );
    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.message }), {
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

    const { slug } = body;
    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if already bookmarked
    const existingRes = await supabaseRest(
      `bookmarks?user_id=eq.${encodeURIComponent(userId)}&slug=eq.${encodeURIComponent(slug)}&select=id`
    );
    const existing = await existingRes.json();

    if (existing && existing.length > 0) {
      // Remove bookmark (toggle)
      await supabaseRest(`bookmarks?id=eq.${existing[0].id}`, {
        method: "DELETE",
        prefer: "return=minimal",
      });

      return new Response(JSON.stringify({ bookmarked: false, slug }), {
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Add bookmark
    const res = await supabaseRest("bookmarks", {
      method: "POST",
      body: JSON.stringify({ user_id: userId, slug }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ bookmarked: true, slug }), {
      status: 201,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  if (request.method === "DELETE") {
    const slug = url.searchParams.get("slug");
    if (!slug) {
      return new Response(JSON.stringify({ error: "Missing slug" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const res = await supabaseRest(
      `bookmarks?user_id=eq.${encodeURIComponent(userId)}&slug=eq.${encodeURIComponent(slug)}`,
      { method: "DELETE", prefer: "return=minimal" }
    );

    if (!res.ok) {
      const data = await res.json();
      return new Response(JSON.stringify({ error: data.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ bookmarked: false, slug }), {
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
