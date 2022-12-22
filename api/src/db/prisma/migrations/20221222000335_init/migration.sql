-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "citext";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USER', 'MODERATOR');

-- CreateEnum
CREATE TYPE "LinkedIdentities" AS ENUM ('steam64', 'discord');

-- CreateEnum
CREATE TYPE "Day" AS ENUM ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun');

-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('ANNOUNCED', 'REGISTERATION', 'ONGOING', 'COMPLETED');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('Scheduled', 'Setup', 'Ongoing', 'Completed');

-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT,
    "password_hash_token" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "username" CITEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roles" "Role"[],
    "university_id" INTEGER,
    "steam_64_id" TEXT,
    "discord_id" TEXT,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university" (
    "id" SERIAL NOT NULL,
    "name" CITEXT NOT NULL,

    CONSTRAINT "university_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "university_domain" (
    "domain" TEXT NOT NULL,
    "university_id" INTEGER NOT NULL,

    CONSTRAINT "university_domain_pkey" PRIMARY KEY ("domain","university_id")
);

-- CreateTable
CREATE TABLE "team" (
    "id" SERIAL NOT NULL,
    "name" CITEXT NOT NULL,
    "university_id" INTEGER NOT NULL,
    "invite_code" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "team_user" (
    "captain" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,
    "team_id" INTEGER NOT NULL,

    CONSTRAINT "team_user_pkey" PRIMARY KEY ("user_id","team_id")
);

-- CreateTable
CREATE TABLE "tournament" (
    "id" SERIAL NOT NULL,
    "game_id" TEXT NOT NULL,
    "match_start_time" TIMESTAMPTZ NOT NULL,
    "match_day" "Day" NOT NULL,
    "state" "TournamentStatus" NOT NULL,

    CONSTRAINT "tournament_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tournament_team" (
    "team_id" INTEGER NOT NULL,
    "tournament_id" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tournament_team_pkey" PRIMARY KEY ("team_id","tournament_id")
);

-- CreateTable
CREATE TABLE "game" (
    "id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "teams_per_match" INTEGER NOT NULL,
    "players_per_team" INTEGER NOT NULL,
    "has_veto" BOOLEAN NOT NULL,
    "required_ids" "LinkedIdentities"[],

    CONSTRAINT "game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match" (
    "id" UUID NOT NULL,
    "game_id" TEXT NOT NULL,
    "status" "MatchStatus" NOT NULL,
    "start_time" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_team" (
    "id" SERIAL NOT NULL,
    "team_id" INTEGER NOT NULL,
    "match_id" UUID NOT NULL,
    "team_number" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "match_details_csgo" (
    "id" SERIAL NOT NULL,
    "matchId" UUID NOT NULL,
    "map" TEXT,
    "team_1_score" INTEGER NOT NULL DEFAULT 0,
    "team_2_score" INTEGER NOT NULL DEFAULT 0,
    "team_1_steam_ids" TEXT[],
    "team_2_steam_ids" TEXT[]
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_password_hash_token_key" ON "user"("password_hash_token");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_steam_64_id_key" ON "user"("steam_64_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_discord_id_key" ON "user"("discord_id");

-- CreateIndex
CREATE UNIQUE INDEX "university_name_key" ON "university"("name");

-- CreateIndex
CREATE UNIQUE INDEX "university_domain_domain_key" ON "university_domain"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "team_invite_code_key" ON "team"("invite_code");

-- CreateIndex
CREATE UNIQUE INDEX "team_university_id_name_key" ON "team"("university_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "game_id_key" ON "game"("id");

-- CreateIndex
CREATE UNIQUE INDEX "match_team_id_key" ON "match_team"("id");

-- CreateIndex
CREATE UNIQUE INDEX "match_team_team_id_match_id_key" ON "match_team"("team_id", "match_id");

-- CreateIndex
CREATE UNIQUE INDEX "match_details_csgo_id_key" ON "match_details_csgo"("id");

-- CreateIndex
CREATE UNIQUE INDEX "match_details_csgo_matchId_key" ON "match_details_csgo"("matchId");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "university"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "university_domain" ADD CONSTRAINT "university_domain_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "university"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team" ADD CONSTRAINT "team_university_id_fkey" FOREIGN KEY ("university_id") REFERENCES "university"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_user" ADD CONSTRAINT "team_user_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_user" ADD CONSTRAINT "team_user_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament" ADD CONSTRAINT "tournament_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_team" ADD CONSTRAINT "tournament_team_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tournament_team" ADD CONSTRAINT "tournament_team_tournament_id_fkey" FOREIGN KEY ("tournament_id") REFERENCES "tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_team" ADD CONSTRAINT "match_team_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_team" ADD CONSTRAINT "match_team_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_details_csgo" ADD CONSTRAINT "match_details_csgo_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
