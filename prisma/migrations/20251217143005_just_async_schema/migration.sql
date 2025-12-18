/*
  Warnings:

  - You are about to drop the column `date` on the `result` table. All the data in the column will be lost.
  - You are about to drop the column `obtainMarks` on the `result` table. All the data in the column will be lost.
  - You are about to drop the column `teacherId` on the `result` table. All the data in the column will be lost.
  - Added the required column `class` to the `result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `resultType` to the `result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `session` to the `result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `result` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadedById` to the `result` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `subject` on the `result` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `session` to the `student` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Subject" AS ENUM ('ENGLISH', 'URDU', 'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'THQ', 'PAK_STUDY', 'MATH', 'STAT', 'ECONOMICS', 'COMPUTER', 'SOCIOLOGY', 'EDUCATION', 'ISL_ELE', 'H_AND_P_EDUCATION', 'PSYCHOLOGY');

-- CreateEnum
CREATE TYPE "ResultType" AS ENUM ('DECEMBER_TEST', 'MID_TERM', 'FINAL', 'OTHER');

-- DropForeignKey
ALTER TABLE "result" DROP CONSTRAINT "result_teacherId_fkey";

-- DropIndex
DROP INDEX "result_teacherId_idx";

-- AlterTable
ALTER TABLE "result" DROP COLUMN "date",
DROP COLUMN "obtainMarks",
DROP COLUMN "teacherId",
ADD COLUMN     "class" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "resultType" "ResultType" NOT NULL,
ADD COLUMN     "session" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "uploadedById" TEXT NOT NULL,
DROP COLUMN "subject",
ADD COLUMN     "subject" "Subject" NOT NULL;

-- AlterTable
ALTER TABLE "student" ADD COLUMN     "session" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "student_result" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "resultId" TEXT NOT NULL,
    "obtainedMarks" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_result_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "student_result_studentId_idx" ON "student_result"("studentId");

-- CreateIndex
CREATE INDEX "student_result_resultId_idx" ON "student_result"("resultId");

-- CreateIndex
CREATE UNIQUE INDEX "student_result_studentId_resultId_key" ON "student_result"("studentId", "resultId");

-- CreateIndex
CREATE INDEX "result_uploadedById_idx" ON "result"("uploadedById");

-- CreateIndex
CREATE INDEX "result_subject_idx" ON "result"("subject");

-- CreateIndex
CREATE INDEX "result_resultType_idx" ON "result"("resultType");

-- AddForeignKey
ALTER TABLE "result" ADD CONSTRAINT "result_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_result" ADD CONSTRAINT "student_result_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_result" ADD CONSTRAINT "student_result_resultId_fkey" FOREIGN KEY ("resultId") REFERENCES "result"("id") ON DELETE CASCADE ON UPDATE CASCADE;
