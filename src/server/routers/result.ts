import { z } from "zod";
import {
  adminProcedure,
  protectedProcedure,
  router,
  staffProcedure,
} from "../trpc";
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

const resultTypeEnum = z.enum(["DECEMBER_TEST", "MID_TERM", "OTHER"]);

export const resultRouter = router({
  getMe: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      select: { role: true, name: true, email: true },
    });
  }),
  // server/routers/result.ts

  getAll: staffProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(10),
        page: z.number().min(1).default(1),
        search: z.string().optional(),
        resultTypeFilter: z
          .enum(["ALL", "DECEMBER_TEST", "MID_TERM", "FINAL", "OTHER"])
          .default("ALL"),
      })
    )
    .query(async ({ ctx, input }) => {
      const { limit, page, search, resultTypeFilter } = input;
      const skip = (page - 1) * limit;

      const where: any = { AND: [] };

      // Role Security
      if (ctx.user.role !== "ADMIN") {
        where.AND.push({ uploadedById: ctx.user.id });
      }

      // Tab Filter
      if (resultTypeFilter !== "ALL") {
        where.AND.push({ resultType: resultTypeFilter });
      }

      // Comprehensive Search
      if (search) {
        const searchUpper = search.toUpperCase();
        // Find all subjects that contain the search string (e.g., "PHY" matches "PHYSICS")
        const matchedSubjects = Object.values(Subject).filter((s) =>
          s.includes(searchUpper)
        );

        // Find all result types that contain the search string
        const matchedTypes = Object.values(ResultType).filter((t) =>
          t.includes(searchUpper)
        );
        where.AND.push({
          OR: [
            // String fields
            { class: { contains: search, mode: "insensitive" } },
            { degree: { contains: search, mode: "insensitive" } },
            { session: { contains: search, mode: "insensitive" } },

            // Relationship field (Teacher name)
            {
              uploadedBy: {
                name: { contains: search, mode: "insensitive" },
              },
            },

            // Now it matches if the subject is in our "matched" list
            ...(matchedSubjects.length > 0
              ? [{ subject: { in: matchedSubjects } }]
              : []),
            ...(matchedTypes.length > 0
              ? [{ resultType: { in: matchedTypes } }]
              : []),
          ],
        });
      }

      const [results, total] = await Promise.all([
        ctx.db.result.findMany({
          take: limit,
          skip,
          where,
          include: {
            uploadedBy: { select: { name: true, email: true } },
            _count: { select: { studentResults: true } },
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

  getById: staffProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      // Add this log to debug
      console.log('Fetching result with ID:', input.id);

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

      // Add this log to see what's being returned
      console.log('Found result:', result?.subject, 'with', result?.studentResults.length, 'students');

      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Result not found",
        });
      }

      return result;
    }),
  // getById: staffProcedure
  //   .input(z.object({ id: z.string() }))
  //   .query(async ({ ctx, input }) => {
  //     const result = await ctx.db.result.findUnique({
  //       where: { id: input.id },
  //       include: {
  //         uploadedBy: {
  //           select: {
  //             name: true,
  //             email: true,
  //             role: true,
  //           },
  //         },
  //         studentResults: {
  //           include: {
  //             student: {
  //               select: {
  //                 name: true,
  //                 rollNo: true,
  //               },
  //             },
  //           },
  //           orderBy: {
  //             student: {
  //               rollNo: "asc",
  //             },
  //           },
  //         },
  //       },
  //     });

  //     if (!result) {
  //       throw new TRPCError({
  //         code: "NOT_FOUND",
  //         message: "Result not found",
  //       });
  //     }

  //     return result;
  //   }),

  create: staffProcedure
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

      const ApprovedTeacher = await ctx.db.user.findUnique({
        where: { id: ctx.user.id },
      });

      if (!ApprovedTeacher || !ApprovedTeacher.isApproved) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to upload results.",
        });
      }

      // Validate that all students exist
      const students = await ctx.db.student.findMany({
        where: {
          rollNo: {
            in: studentResults.map((sr) => sr.rollNo),
          },
          session: input.session,
          class: input.class,
          degree: input.degree,
        },
      });

      if (students.length !== studentResults.length) {
        const foundRollNos = students.map((s) => s.rollNo);
        const missingRollNos = studentResults
          .map((sr) => sr.rollNo)
          .filter((rollNo) => !foundRollNos.includes(rollNo));

        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Students with these roll numbers not found: ${missingRollNos.join(
            ", "
          )}`,
        });
      }

      // Validate marks don't exceed total marks
      const invalidMarks = studentResults.filter(
        (sr) => sr.obtainedMarks > input.totalMarks
      );
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

  getStats: staffProcedure.query(async ({ ctx }) => {
    const where: any = {};
    if (ctx.user.role !== "ADMIN") {
      where.uploadedById = ctx.user.id;
    }

    // const total = await ctx.db.result.count();
    // const decemberTest = await ctx.db.result.count({
    //   where: { resultType: "DECEMBER_TEST" },
    // });
    // const midTerm = await ctx.db.result.count({
    //   where: { resultType: "MID_TERM" },
    // });
    // const other = await ctx.db.result.count({ where: { resultType: "OTHER" } });

    // return {
    //   total,
    //   decemberTest,
    //   midTerm,
    //   other,
    // };
    const [total, december, mid, other] = await Promise.all([
      ctx.db.result.count({ where }),
      ctx.db.result.count({ where: { ...where, resultType: "DECEMBER_TEST" } }),
      ctx.db.result.count({ where: { ...where, resultType: "MID_TERM" } }),
      ctx.db.result.count({ where: { ...where, resultType: "OTHER" } }),
    ]);

    return { total, decemberTest: december, midTerm: mid, other };
  }),
  getDegreeComparison: staffProcedure
    .input(z.object({ session: z.string() }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.result.findMany({
        where: {
          uploadedById: ctx.user.id,
          session: input.session
        },
        include: { studentResults: true },
        orderBy: { createdAt: 'asc' }
      });

      // We group by ResultType (Mid Term, December, etc.) 
      // and calculate the average for each degree category
      const chartData = results.reduce((acc: any[], curr) => {
        let dataPoint = acc.find(d => d.name === curr.resultType);

        if (!dataPoint) {
          dataPoint = { name: curr.resultType };
          acc.push(dataPoint);
        }

        const avg = curr.studentResults.length > 0
          ? curr.studentResults.reduce((s, r) => s + r.obtainedMarks, 0) / curr.studentResults.length
          : 0;

        dataPoint[curr.degree] = Number(avg.toFixed(1));
        return acc;
      }, []);

      return chartData;
    }),

  searchStudentResults: staffProcedure
    .input(
      z.object({
        rollNo: z.string().min(1),
        session: z.string().min(1),
        class: z.string().min(1),
        degree: z.string().min(1),
        resultType: z.union([resultTypeEnum, z.literal("ALL")]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const where: any = {
        student: {
          rollNo: input.rollNo,
        },
        result: {
          session: input.session,
          class: input.class,
          degree: input.degree,
        },
      };

      // Only filter by result type if not ALL
      if (input.resultType !== "ALL") {
        where.result.resultType = input.resultType;
      }

      // 1. Find the student results that match the criteria
      const studentResults = await ctx.db.studentResult.findMany({
        where,
        include: {
          result: {
            select: {
              subject: true,
              totalMarks: true,
              resultType: true,
              session: true,
            },
          },
          student: {
            select: {
              name: true,
              rollNo: true,
            },
          },
        },
      });

      if (studentResults.length === 0) {
        // Check if student exists at least
        const student = await ctx.db.student.findUnique({
          where: { rollNo: input.rollNo },
        });

        if (!student) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Student not found with this Roll No.",
          });
        }

        return []; // Student exists but no results for this criteria
      }

      // 2. Format the response
      return studentResults.map((sr) => {
        const percentage = (sr.obtainedMarks / sr.result.totalMarks) * 100;
        let grade = "F";
        if (percentage >= 80) grade = "A+";
        else if (percentage >= 70) grade = "A";
        else if (percentage >= 60) grade = "B";
        else if (percentage >= 50) grade = "C";
        else if (percentage >= 40) grade = "D";
        else if (percentage >= 33) grade = "E";

        return {
          id: sr.id,
          subject: sr.result.subject,
          totalMarks: sr.result.totalMarks,
          obtainedMarks: sr.obtainedMarks,
          percentage: percentage.toFixed(2),
          grade,
          studentName: sr.student.name,
          rollNo: sr.student.rollNo,
          resultType: sr.result.resultType,
        };
      });
    }),
});
