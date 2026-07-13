import commentsHandler from "../../../api/comments.js";

export const prerender = false;

export async function ALL({ request }) {
  return commentsHandler(request);
}
