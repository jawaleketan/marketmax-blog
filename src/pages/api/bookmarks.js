import bookmarksHandler from "../../../api/bookmarks.js";

export const prerender = false;

export async function ALL({ request }) {
  return bookmarksHandler(request);
}
