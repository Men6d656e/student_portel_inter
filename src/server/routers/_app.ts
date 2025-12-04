import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../trpc";

export const appRouter = router({
  hello: publicProcedure
    .input(
      z.object({
        text: z.string(),
      })
    )
    .query((opts) => {
      return {
        greeting: `Hello ${opts.input.text}`,
      };
    }),

  protectedData: protectedProcedure.query(({ ctx }) => {
    const username = ctx.user.name ?? "User";
    return `Hello, ${username}! You can see this because you are logged in.`;
  }),
});

export type AppRouter = typeof appRouter;
