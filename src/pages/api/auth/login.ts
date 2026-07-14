import { signIn } from "../../../lib/auth";

export const prerender = false;

export async function POST({ request }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400 });
  }

  const { email, password } = body;

  if (!email || !password) {
    return new Response(JSON.stringify({ error: "Email and password required" }), { status: 400 });
  }

  try {
    const result = await signIn(email, password);

    if (result.error) {
      return new Response(JSON.stringify({ error: result.error }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      user: { email: result.user.email },
      access_token: result.session.access_token,
      refresh_token: result.session.refresh_token,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Server error: " + (err.message || "unknown") }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
