import {
  authMiddleware as clerkAuthMiddleware,
  redirectToSignIn,
} from "@clerk/nextjs";
import type { Autocomplete } from "@clerk/types";
import { verifyKey } from "@unkey/api";
import type Link from "next/link";
import { NextResponse, type NextRequest } from "next/server";

type WithPathPatternWildcard<T> = `${T & string}(.*)`;
type NextTypedRoute<T = Parameters<typeof Link>["0"]["href"]> = T extends string
  ? T
  : never;

type RouteMatcherWithNextTypedRoutes = Autocomplete<
  WithPathPatternWildcard<NextTypedRoute> | NextTypedRoute
>;

export type RouteMatcherParam =
  | Array<RegExp | RouteMatcherWithNextTypedRoutes>
  | RegExp
  | RouteMatcherWithNextTypedRoutes
  | ((req: NextRequest) => boolean);

interface AuthMiddlewareParams {
  /**
   * A list of routes that should be with API keys authentication.
   * You can use glob patterns to match multiple routes or a function to match against the request object.
   * Path patterns and regular expressions are supported, for example: `['/foo', '/bar(.*)'] or `[/^\/foo\/.*$/]`
   */
  protectedWithKeys: RouteMatcherParam;
}

const authMiddleware = ({ protectedWithKeys }: AuthMiddlewareParams) =>
  /**
   * This would be a new option in Clerk's SDK middleware, but for now we're passing it `publicKeys`.
   *
   * The current workaround for developers that integrate Unkey with Clerk, requires setting protected routes with keys to
   * publicRoutes in order to bypass the user's identity verification on the request headers.
   */
  clerkAuthMiddleware({
    publicRoutes: protectedWithKeys,
    afterAuth(auth, req, evt) {
      // Handle users who aren't authenticated
      if (!auth.userId && !auth.isPublicRoute) {
        return redirectToSignIn({ returnBackUrl: req.url });
      }

      // If the user is signed in and trying to access a protected route, allow them to access route
      if (auth.userId && !auth.isPublicRoute) {
        return NextResponse.next();
      }

      // Handle routes protected with API keys
      if (
        !auth.userId &&
        auth.isPublicRoute &&
        req.nextUrl.pathname === "/api/protected-with-key"
      ) {
        return protectWithExternalKeys(req);
      }

      // Allow users visiting public routes to access them
      return NextResponse.next();
    },
  });

async function protectWithExternalKeys(req: NextRequest) {
  const header = req.headers.get("Authorization");

  if (!header) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { result, error } = await verifyKey(stripAuthorizationHeader(header));

  if (error) {
    return new Response("Internal Server Error", { status: 500 });
  }

  if (!result.valid) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (result.ownerId) {
    // This would be inserted into Clerk's `__session` cookie
    req.cookies.set("externalClientId", result.ownerId);
  }

  return NextResponse.next();
}

function stripAuthorizationHeader(authValue: string) {
  return authValue?.replace("Bearer ", "");
}

export { authMiddleware };
