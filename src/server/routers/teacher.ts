import { z } from "zod";
import { adminProcedure, router, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { sendVerificationEmail, sendCredentialsEmail } from "@/lib/email";
import { auth } from "@/lib/auth";

export const teacherRouter = router({
    getStats: adminProcedure.query(async ({ ctx }) => {
        const totalTeachers = await ctx.db.user.count({ where: { role: "TEACHER" } });
        const verifiedTeachers = await ctx.db.user.count({ where: { role: "TEACHER", emailVerified: true } });
        const unverifiedTeachers = await ctx.db.user.count({ where: { role: "TEACHER", emailVerified: false } });
        const totalResults = await ctx.db.result.count();

        return {
            totalTeachers,
            verifiedTeachers,
            unverifiedTeachers,
            totalResults,
        };
    }),

    getAll: adminProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(10),
                page: z.number().min(1).default(1),
                search: z.string().optional(),
                filter: z.enum(["ALL", "VERIFIED", "UNVERIFIED"]).default("ALL"),
            })
        )
        .query(async ({ ctx, input }) => {
            const { limit, page, search, filter } = input;
            const skip = (page - 1) * limit;

            const where: any = {
                role: "TEACHER",
            };

            if (search) {
                where.OR = [
                    { name: { contains: search, mode: "insensitive" } },
                    { email: { contains: search, mode: "insensitive" } },
                ];
            }

            if (filter === "VERIFIED") {
                where.emailVerified = true;
            } else if (filter === "UNVERIFIED") {
                where.emailVerified = false;
            }

            const [teachers, total] = await Promise.all([
                ctx.db.user.findMany({
                    take: limit,
                    skip,
                    where,
                    include: {
                        _count: {
                            select: { uploadedResults: true },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                }),
                ctx.db.user.count({ where }),
            ]);

            return {
                teachers,
                total,
                totalPages: Math.ceil(total / limit),
            };
        }),

    getById: adminProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.user.findUnique({
                where: { id: input.id },
                include: {
                    _count: {
                        select: { uploadedResults: true },
                    },
                },
            });
        }),

    getRankings: adminProcedure.query(async ({ ctx }) => {
        const teachers = await ctx.db.user.findMany({
            where: { role: "TEACHER" },
            select: {
                id: true,
                name: true,
                email: true,
                _count: {
                    select: { uploadedResults: true },
                },
            },
        });

        const ranked = teachers
            .map((t) => ({
                name: t.name || t.email,
                uploads: t._count.uploadedResults,
            }))
            .sort((a, b) => b.uploads - a.uploads)
            .slice(0, 10);

        return ranked;
    }),

    create: adminProcedure
        .input(
            z.object({
                name: z.string().min(2),
                email: z.string().email(),
                password: z.string().min(8), // Password is required from client
            })
        )
        .mutation(async ({ ctx, input }) => {
            try {
                // Use better-auth API to create user
                await auth.api.signUpEmail({
                    body: {
                        email: input.email,
                        password: input.password,
                        name: input.name,
                        role: "TEACHER", // Explicitly set role
                        isApproved: true, // Teachers created by admin are auto-approved
                    },
                    asResponse: false,
                    headers: ctx.headers,
                });

                // Send separate credentials email
                await sendCredentialsEmail({
                    email: input.email,
                    password: input.password,
                    name: input.name
                });

            } catch (error) {
                console.error("Failed to create user:", error);
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create user" });
            }

            return { email: input.email, name: input.name };
        }),

    update: adminProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(2),
            })
        )
        .mutation(async ({ ctx, input }) => {
            return ctx.db.user.update({
                where: { id: input.id },
                data: { name: input.name },
            });
        }),

    delete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            await ctx.db.result.deleteMany({ where: { teacherId: input.id } });
            return ctx.db.user.delete({ where: { id: input.id } });
        }),
});
