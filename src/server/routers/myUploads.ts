// server/routers/result.ts
import { z } from "zod";
import { router, staffProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const UploadedResultRouter = router({
  getMyUploads: staffProcedure
    .input(
      z.object({
        classYear: z.enum(["1st Year", "2nd Year"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      // Fetch results uploaded ONLY by the current teacher
      const uploads = await ctx.db.result.findMany({
        where: {
          uploadedById: ctx.user.id,
          // If your DB uses "1st Year" strings or you map them:
          class: input.classYear, 
        },
        include: {
          _count: {
            select: { studentResults: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return uploads;
    }),
});