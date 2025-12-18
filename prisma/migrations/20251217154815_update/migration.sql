/*
  Warnings:

  - The values [FINAL] on the enum `ResultType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ResultType_new" AS ENUM ('DECEMBER_TEST', 'MID_TERM', 'OTHER');
ALTER TABLE "result" ALTER COLUMN "resultType" TYPE "ResultType_new" USING ("resultType"::text::"ResultType_new");
ALTER TYPE "ResultType" RENAME TO "ResultType_old";
ALTER TYPE "ResultType_new" RENAME TO "ResultType";
DROP TYPE "public"."ResultType_old";
COMMIT;
