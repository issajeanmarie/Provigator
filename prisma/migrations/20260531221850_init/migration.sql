-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail" TEXT,
    "currentStatus" TEXT NOT NULL DEFAULT 'CHECKING',
    "responseTime" INTEGER,
    "lastCheckedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonitoringLog" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responseTime" INTEGER,
    "errorMessage" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonitoringLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_url_key" ON "Project"("url");

-- CreateIndex
CREATE INDEX "Project_currentStatus_idx" ON "Project"("currentStatus");

-- CreateIndex
CREATE INDEX "Project_url_idx" ON "Project"("url");

-- CreateIndex
CREATE INDEX "MonitoringLog_projectId_idx" ON "MonitoringLog"("projectId");

-- CreateIndex
CREATE INDEX "MonitoringLog_checkedAt_idx" ON "MonitoringLog"("checkedAt");

-- CreateIndex
CREATE INDEX "MonitoringLog_projectId_checkedAt_idx" ON "MonitoringLog"("projectId", "checkedAt");

-- CreateIndex
CREATE INDEX "Session_email_idx" ON "Session"("email");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- AddForeignKey
ALTER TABLE "MonitoringLog" ADD CONSTRAINT "MonitoringLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
