CREATE EXTENSION IF NOT EXISTS citext;

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'MODERATOR');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('ANNOUNCED', 'REGISTERATION', 'ONGOING', 'COMPLETED');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "passwordResetToken" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "username" CITEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roles" "Role"[],
    "universityId" INTEGER,
    "steam64Id" TEXT,
    "discordId" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "university_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "universityDomain" (
    "domain" TEXT NOT NULL,
    "universityId" INTEGER NOT NULL,

    CONSTRAINT "universityDomain_pkey" PRIMARY KEY ("domain","universityId")
);

-- CreateTable
CREATE TABLE "team" (
    "id" SERIAL NOT NULL,
    "name" CITEXT NOT NULL,
    "universityId" INTEGER NOT NULL,
    "inviteCode" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "userTeam" (
    "captain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" UUID NOT NULL,
    "teamId" INTEGER NOT NULL,

    CONSTRAINT "userTeam_pkey" PRIMARY KEY ("userId","teamId")
);

-- CreateTable
CREATE TABLE "tournament" (
    "id" SERIAL NOT NULL,
    "state" "TournamentStatus" NOT NULL,

    CONSTRAINT "tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "teamTournament" (
    "teamId" INTEGER NOT NULL,
    "tournamentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "teamTournament_pkey" PRIMARY KEY ("teamId","tournamentId")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_passwordResetToken_key" ON "user"("passwordResetToken");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_steam64Id_key" ON "user"("steam64Id");

-- CreateIndex
CREATE UNIQUE INDEX "user_discordId_key" ON "user"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "university_name_key" ON "university"("name");

-- CreateIndex
CREATE UNIQUE INDEX "universityDomain_domain_key" ON "universityDomain"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "team_inviteCode_key" ON "team"("inviteCode");

-- CreateIndex
CREATE UNIQUE INDEX "team_universityId_name_key" ON "team"("universityId", "name");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "university"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "universityDomain" ADD CONSTRAINT "universityDomain_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "university"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "university"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userTeam" ADD CONSTRAINT "userTeam_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "userTeam" ADD CONSTRAINT "userTeam_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamTournament" ADD CONSTRAINT "teamTournament_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "teamTournament" ADD CONSTRAINT "teamTournament_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
