import { authMiddleware } from "@/app/clerk/authMiddleware";

export default authMiddleware({
  protectedWithKeys: ["/api/protected-with-key"],
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};
