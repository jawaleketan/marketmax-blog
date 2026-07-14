import { getCurrentUser } from "../../../lib/auth";

export const prerender = false;

export async function GET({ request }) {
  const user = await getCurrentUser(request);

  if (!user) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), { status: 401 });
  }

  return new Response(JSON.stringify({ user }), {
    headers: { "Content-Type": "application/json" },
  });
}
