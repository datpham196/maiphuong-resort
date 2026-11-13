import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip locale prefix for admin CMS routes.
  matcher: "/((?!api|trpc|_next|_vercel|admin|.*\\..*).*)",
};
