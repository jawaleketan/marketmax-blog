import subscribersHandler from "../../../api/subscribers.js";

export const prerender = false;

export async function ALL({ request }) {
  return subscribersHandler(request);
}
