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

// middleware to check if user is admin
const isAdmin = t.middleware(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not Authenticated" });
  }

  // Auto-promote if email matches ADMIN_EMAIL
  if (
    process.env.ADMIN_EMAIL &&
    ctx.session.user.email === process.env.ADMIN_EMAIL &&
    ctx.session.user.role !== "ADMIN"
  ) {
    await ctx.db.user.update({
      where: { id: ctx.session.user.id },
      data: { role: "ADMIN" },
    });
    ctx.session.user.role = "ADMIN";
  }

  if (ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Access Denied" });
  }

  return next({
    ctx: {
      session: ctx.session,
      user: ctx.session.user,
      db: ctx.db,
    },
  });
});

export const adminProcedure = t.procedure.use(isAdmin);
