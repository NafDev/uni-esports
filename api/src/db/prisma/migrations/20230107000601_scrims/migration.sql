-- CreateTable
CREATE TABLE "Scrim" (
    "id" SERIAL NOT NULL,
    "game_id" TEXT NOT NULL,
    "match_start" TIMESTAMPTZ NOT NULL,
    "deadline" TIMESTAMPTZ NOT NULL,
    "requesting_team_id" INTEGER NOT NULL,
    "accepting_team_id" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "Scrim_id_key" ON "Scrim"("id");

-- AddForeignKey
ALTER TABLE "Scrim" ADD CONSTRAINT "Scrim_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scrim" ADD CONSTRAINT "Scrim_requesting_team_id_fkey" FOREIGN KEY ("requesting_team_id") REFERENCES "team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scrim" ADD CONSTRAINT "Scrim_accepting_team_id_fkey" FOREIGN KEY ("accepting_team_id") REFERENCES "team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
