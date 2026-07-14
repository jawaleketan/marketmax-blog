import { signOut, clearSessionCookies } from "../../../lib/auth";

export const prerender = false;

export async function POST({ request }) {
  await signOut(request);
  const cookies = clearSessionCookies();

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookies.join(", "),
    },
  });
}
