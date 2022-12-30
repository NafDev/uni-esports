/*
  Warnings:

  - You are about to drop the column `matchId` on the `match_details_csgo` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[match_id]` on the table `match_details_csgo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `match_id` to the `match_details_csgo` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "match_details_csgo" DROP CONSTRAINT "match_details_csgo_matchId_fkey";

-- DropIndex
DROP INDEX "match_details_csgo_matchId_key";

-- AlterTable
ALTER TABLE "match_details_csgo" DROP COLUMN "matchId",
ADD COLUMN     "match_id" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "match_details_csgo_match_id_key" ON "match_details_csgo"("match_id");

-- AddForeignKey
ALTER TABLE "match_details_csgo" ADD CONSTRAINT "match_details_csgo_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
