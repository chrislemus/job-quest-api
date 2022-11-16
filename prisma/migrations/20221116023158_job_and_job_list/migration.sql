-- CreateTable
CREATE TABLE "Job" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "location" TEXT,
    "url" TEXT,
    "salary" TEXT,
    "description" TEXT,
    "color" TEXT,
    "jobListId" INTEGER NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobList" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "JobList_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JobList_order_key" ON "JobList"("order");

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_jobListId_fkey" FOREIGN KEY ("jobListId") REFERENCES "JobList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
