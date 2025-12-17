import { z } from "zod";
import { adminProcedure, router } from "../trpc";
import { TRPCError } from "@trpc/server";
import { Subject, ResultType } from "@prisma/client";

// Subject enum validation
const subjectEnum = z.enum([
    "ENGLISH",
    "URDU",
    "PHYSICS",
    "CHEMISTRY",
    "BIOLOGY",
    "THQ",
    "PAK_STUDY",
    "MATH",
    "STAT",
    "ECONOMICS",
    "COMPUTER",
    "SOCIOLOGY",
    "EDUCATION",
    "ISL_ELE",
    "H_AND_P_EDUCATION",
    "PSYCHOLOGY",
]);

const resultTypeEnum = z.enum(["DECEMBER_TEST", "MID_TERM", "FINAL", "OTHER"]);

export const resultRouter = router({
    getAll: adminProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(10),
                page: z.number().min(1).default(1),
                search: z.string().optional(),
                resultTypeFilter: z.enum(["ALL", "DECEMBER_TEST", "MID_TERM", "FINAL", "OTHER"]).default("ALL"),
            })
        )
        .query(async ({ ctx, input }) => {
            const { limit, page, search, resultTypeFilter } = input;
            const skip = (page - 1) * limit;

            const where: any = {};

            if (search) {
                where.OR = [
                    { class: { contains: search, mode: "insensitive" } },
                    { degree: { contains: search, mode: "insensitive" } },
                    { session: { contains: search, mode: "insensitive" } },
                ];
            }

            if (resultTypeFilter !== "ALL") {
                where.resultType = resultTypeFilter;
            }

            const [results, total] = await Promise.all([
                ctx.db.result.findMany({
                    take: limit,
                    skip,
                    where,
                    include: {
                        uploadedBy: {
                            select: {
                                name: true,
                                email: true,
                            },
                        },
                        _count: {
                            select: {
                                studentResults: true,
                            },
                        },
                    },
                    orderBy: { createdAt: "desc" },
                }),
                ctx.db.result.count({ where }),
            ]);

            return {
                results,
                total,
                totalPages: Math.ceil(total / limit),
            };
        }),

    getById: adminProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const result = await ctx.db.result.findUnique({
                where: { id: input.id },
                include: {
                    uploadedBy: {
                        select: {
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                    studentResults: {
                        include: {
                            student: {
                                select: {
                                    name: true,
                                    rollNo: true,
                                },
                            },
                        },
                        orderBy: {
                            student: {
                                rollNo: "asc",
                            },
                        },
                    },
                },
            });

            if (!result) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Result not found",
                });
            }

            return result;
        }),

    create: adminProcedure
        .input(
            z.object({
                subject: subjectEnum,
                resultType: resultTypeEnum,
                totalMarks: z.number().min(1),
                degree: z.string(),
                class: z.string(),
                session: z.string(),
                studentResults: z.array(
                    z.object({
                        rollNo: z.string(),
                        obtainedMarks: z.number().min(0),
                    })
                ),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { studentResults, ...resultData } = input;

            // Validate that all students exist
            const students = await ctx.db.student.findMany({
                where: {
                    rollNo: {
                        in: studentResults.map((sr) => sr.rollNo),
                    },
                },
            });

            if (students.length !== studentResults.length) {
                const foundRollNos = students.map((s) => s.rollNo);
                const missingRollNos = studentResults
                    .map((sr) => sr.rollNo)
                    .filter((rollNo) => !foundRollNos.includes(rollNo));

                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Students with these roll numbers not found: ${missingRollNos.join(", ")}`,
                });
            }

            // Validate marks don't exceed total marks
            const invalidMarks = studentResults.filter((sr) => sr.obtainedMarks > input.totalMarks);
            if (invalidMarks.length > 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Some students have marks exceeding total marks (${input.totalMarks})`,
                });
            }

            // Create result with student results
            const result = await ctx.db.result.create({
                data: {
                    ...resultData,
                    uploadedById: ctx.user.id,
                    studentResults: {
                        create: studentResults.map((sr) => {
                            const student = students.find((s) => s.rollNo === sr.rollNo)!;
                            return {
                                studentId: student.id,
                                obtainedMarks: sr.obtainedMarks,
                            };
                        }),
                    },
                },
                include: {
                    studentResults: true,
                },
            });

            return {
                result,
                message: `Successfully uploaded results for ${studentResults.length} students`,
            };
        }),

    update: adminProcedure
        .input(
            z.object({
                id: z.string(),
                subject: subjectEnum.optional(),
                resultType: resultTypeEnum.optional(),
                totalMarks: z.number().min(1).optional(),
                degree: z.string().optional(),
                class: z.string().optional(),
                session: z.string().optional(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;

            // Check if result exists
            const existing = await ctx.db.result.findUnique({ where: { id } });
            if (!existing) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Result not found",
                });
            }

            return ctx.db.result.update({
                where: { id },
                data,
            });
        }),

    delete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // StudentResults will be deleted automatically due to cascade
            return ctx.db.result.delete({ where: { id: input.id } });
        }),

    getStats: adminProcedure.query(async ({ ctx }) => {
        const total = await ctx.db.result.count();
        const decemberTest = await ctx.db.result.count({ where: { resultType: "DECEMBER_TEST" } });
        const midTerm = await ctx.db.result.count({ where: { resultType: "MID_TERM" } });
        const final = await ctx.db.result.count({ where: { resultType: "FINAL" } });
        const other = await ctx.db.result.count({ where: { resultType: "OTHER" } });

        return {
            total,
            decemberTest,
            midTerm,
            final,
            other,
        };
    }),
});
