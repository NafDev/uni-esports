import type { LinkedIdentities, PrismaClient } from '@prisma/client';
import games from './data/games.json';

export async function run(prisma: PrismaClient) {
	const queries = [];

	for (const game of games) {
		queries.push(
			prisma.game.create({
				data: { ...game, requiredIds: game.requiredIds as LinkedIdentities[] }
			})
		);
	}

	await prisma.$transaction(queries);
}
