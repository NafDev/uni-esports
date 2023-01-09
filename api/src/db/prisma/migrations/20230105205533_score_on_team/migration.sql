/*
  Warnings:

  - You are about to drop the column `team_1_score` on the `match_details_csgo` table. All the data in the column will be lost.
  - You are about to drop the column `team_2_score` on the `match_details_csgo` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "match_details_csgo" DROP COLUMN "team_1_score",
DROP COLUMN "team_2_score";

-- AlterTable
ALTER TABLE "match_team" ADD COLUMN     "score" INTEGER;
