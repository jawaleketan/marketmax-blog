import viewCountHandler from "../../../api/view-count.js";

export const prerender = false;

export async function ALL({ request }) {
  return viewCountHandler(request);
}
