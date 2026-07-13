import reactionsHandler from "../../../api/reactions.js";

export const prerender = false;

export async function ALL({ request }) {
  return reactionsHandler(request);
}
