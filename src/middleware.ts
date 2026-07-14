import { defineMiddleware } from "astro:middleware";
import { getCurrentUser } from "./lib/auth";

const protectedPaths = ["/admin"];
const publicPaths = ["/admin/login", "/api/auth/login"];

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = context.url.pathname;

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isPublic = publicPaths.some((p) => pathname.startsWith(p));

  if (!isProtected || isPublic) {
    return next();
  }

  const user = await getCurrentUser(context.request);

  if (!user) {
    return context.redirect("/admin/login");
  }

  context.locals.adminUser = user;
  return next();
});
