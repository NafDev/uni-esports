import type { PrismaClient } from '@prisma/client';
import universities from './data/universities.json';

export async function run(prisma: PrismaClient) {
	const queries = [];

	for (const uni of universities) {
		queries.push(
			prisma.university.create({
				data: {
					name: uni.name,
					domains: {
						createMany: {
							data: uni.domains.map((domain) => {
								return { domain };
							}),
							skipDuplicates: true
						}
					}
				}
			})
		);
	}

	await prisma.$transaction(queries);
}
