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

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method === "GET") {
    const res = await supabaseRest("subscribers?confirmed=eq.true&select=id");
    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(JSON.stringify({ count: data?.length || 0 }), {
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

    const { email } = body;

    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Valid email required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Check if already subscribed
    const existingRes = await supabaseRest(
      `subscribers?email=eq.${encodeURIComponent(email.toLowerCase())}&select=id,confirmed`
    );
    const existing = await existingRes.json();

    if (existing && existing.length > 0) {
      if (existing[0].confirmed) {
        return new Response(
          JSON.stringify({ success: true, message: "Already subscribed!" }),
          { headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      // Re-confirm
      const updateRes = await supabaseRest(`subscribers?id=eq.${existing[0].id}`, {
        method: "PATCH",
        body: JSON.stringify({ confirmed: true }),
      });

      if (!updateRes.ok) {
        const data = await updateRes.json();
        return new Response(JSON.stringify({ error: data.message }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        });
      }

      return new Response(
        JSON.stringify({ success: true, message: "Welcome back! You're now subscribed." }),
        { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // New subscriber
    const res = await supabaseRest("subscribers", {
      method: "POST",
      body: JSON.stringify({ email: email.toLowerCase(), confirmed: true }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Subscribed! Welcome aboard." }),
      { status: 201, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
};

export const config = { path: "/api/subscribers" };
