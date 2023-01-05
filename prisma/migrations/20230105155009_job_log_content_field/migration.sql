/*
  Warnings:

  - Added the required column `content` to the `JobLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JobLog" ADD COLUMN     "content" TEXT NOT NULL;
