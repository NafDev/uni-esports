/*
  Warnings:

  - Made the column `score` on table `match_team` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "match_team" ALTER COLUMN "score" SET NOT NULL,
ALTER COLUMN "score" SET DEFAULT 0;
