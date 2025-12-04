import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context";
import superjson from "superjson";

// initilize trpc with context
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// middleware to check theauthentication
const isAuthenticated = t.middleware(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not Authenticated" });
  }
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.session.user,
      db: ctx.db,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthenticated);
