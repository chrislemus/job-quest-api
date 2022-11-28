-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_userId_fkey";

-- DropForeignKey
ALTER TABLE "JobList" DROP CONSTRAINT "JobList_userId_fkey";

-- AlterTable
ALTER TABLE "JobList" ALTER COLUMN "order" DROP DEFAULT;
DROP SEQUENCE "JobList_order_seq";

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobList" ADD CONSTRAINT "JobList_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
