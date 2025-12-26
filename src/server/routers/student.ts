import { z } from "zod";
import { adminProcedure, router, staffProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

export const studentRouter = router({
    getAll: adminProcedure
        .input(
            z.object({
                limit: z.number().min(1).max(100).default(10),
                page: z.number().min(1).default(1),
                search: z.string().optional(),
                classFilter: z.enum(["ALL", "1st Year", "2nd Year"]).default("ALL"),
            })
        )
        .query(async ({ ctx, input }) => {
            const { limit, page, search, classFilter } = input;
            const skip = (page - 1) * limit;

            const where: any = {};

            if (search) {
                where.OR = [
                    { name: { contains: search, mode: "insensitive" } },
                    { rollNo: { contains: search, mode: "insensitive" } },
                    { degree: { contains: search, mode: "insensitive" } },
                ];
            }

            if (classFilter !== "ALL") {
                where.class = classFilter;
            }

            const [students, total] = await Promise.all([
                ctx.db.student.findMany({
                    take: limit,
                    skip,
                    where,
                    include: {
                        _count: {
                            select: { studentResults: true }
                        }
                    },
                    orderBy: { createdAt: "desc" },
                }),
                ctx.db.student.count({ where }),
            ]);

            return {
                students,
                total,
                totalPages: Math.ceil(total / limit),
            };
        }),

    getById: adminProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            return ctx.db.student.findUnique({
                where: { id: input.id },
            });
        }),

    getWithResults: staffProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ ctx, input }) => {
            const student = await ctx.db.student.findUnique({
                where: { id: input.id },
                include: {
                    studentResults: {
                        include: {
                            result: true,
                        },
                        orderBy: {
                            result: {
                                createdAt: "desc",
                            },
                        },
                    },
                },
            });

            if (!student) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Student not found",
                });
            }

            return student;
        }),


    create: adminProcedure
        .input(
            z.object({
                name: z.string().min(2),
                rollNo: z.string().min(1),
                class: z.string(),
                degree: z.string(),
                session: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            // Check if rollNo already exists
            const existing = await ctx.db.student.findUnique({
                where: { rollNo: input.rollNo },
            });

            if (existing) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: `Student with roll number ${input.rollNo} already exists`,
                });
            }

            return ctx.db.student.create({
                data: input,
            });
        }),

    bulkCreate: adminProcedure
        .input(
            z.object({
                students: z.array(
                    z.object({
                        name: z.string().min(2),
                        rollNo: z.string().min(1),
                        class: z.string(),
                        degree: z.string(),
                        session: z.string(),
                    })
                ),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { students } = input;

            // Check for duplicate roll numbers in the input
            const rollNos = students.map((s) => s.rollNo);
            const duplicates = rollNos.filter((item, index) => rollNos.indexOf(item) !== index);

            if (duplicates.length > 0) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: `Duplicate roll numbers found in file: ${duplicates.join(", ")}`,
                });
            }

            // Check for existing students
            const existingStudents = await ctx.db.student.findMany({
                where: {
                    rollNo: { in: rollNos },
                },
                select: { rollNo: true },
            });

            if (existingStudents.length > 0) {
                const existingRollNos = existingStudents.map((s) => s.rollNo);
                throw new TRPCError({
                    code: "CONFLICT",
                    message: `Students with these roll numbers already exist: ${existingRollNos.join(", ")}`,
                });
            }

            // Create all students
            const created = await ctx.db.student.createMany({
                data: students,
            });

            return {
                count: created.count,
                message: `Successfully imported ${created.count} students`,
            };
        }),

    update: adminProcedure
        .input(
            z.object({
                id: z.string(),
                name: z.string().min(2),
                rollNo: z.string().min(1),
                class: z.string(),
                degree: z.string(),
                session: z.string(),
            })
        )
        .mutation(async ({ ctx, input }) => {
            const { id, ...data } = input;

            // Check if rollNo is being changed and if it conflicts
            const student = await ctx.db.student.findUnique({ where: { id } });
            if (student && student.rollNo !== data.rollNo) {
                const existing = await ctx.db.student.findUnique({
                    where: { rollNo: data.rollNo },
                });
                if (existing) {
                    throw new TRPCError({
                        code: "CONFLICT",
                        message: `Student with roll number ${data.rollNo} already exists`,
                    });
                }
            }

            return ctx.db.student.update({
                where: { id },
                data,
            });
        }),

    delete: adminProcedure
        .input(z.object({ id: z.string() }))
        .mutation(async ({ ctx, input }) => {
            return ctx.db.student.delete({ where: { id: input.id } });
        }),

    getStats: adminProcedure.query(async ({ ctx }) => {
        const total = await ctx.db.student.count();
        const firstYear = await ctx.db.student.count({ where: { class: "1st Year" } });
        const secondYear = await ctx.db.student.count({ where: { class: "2nd Year" } });

        return {
            total,
            firstYear,
            secondYear,
        };
    }),
});
