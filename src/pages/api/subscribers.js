import { getSupabaseServerClient } from "../../lib/supabase";

export const prerender = false;

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET() {
  const supabase = getSupabaseServerClient();

  const { data, error } = await supabase
    .from("subscribers")
    .select("id")
    .eq("confirmed", true);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ count: data?.length || 0 }), {
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

  const { email } = body;

  if (!email || !isValidEmail(email)) {
    return new Response(JSON.stringify({ error: "Valid email required" }), { status: 400 });
  }

  const { data: existing } = await supabase
    .from("subscribers")
    .select("id, confirmed")
    .eq("email", email.toLowerCase())
    .limit(1);

  if (existing && existing.length > 0) {
    if (existing[0].confirmed) {
      return new Response(
        JSON.stringify({ success: true, message: "Already subscribed!" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const { error } = await supabase
      .from("subscribers")
      .update({ confirmed: true })
      .eq("id", existing[0].id);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    return new Response(
      JSON.stringify({ success: true, message: "Welcome back! You're now subscribed." }),
      { status: 201 }
    );
  }

  const { error } = await supabase.from("subscribers").insert({
    email: email.toLowerCase(),
    confirmed: true,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(
    JSON.stringify({ success: true, message: "Subscribed! Welcome aboard." }),
    { status: 201 }
  );
}
