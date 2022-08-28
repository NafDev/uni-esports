import type { PrismaClient } from '@prisma/client';
import universities from './universities.json';

export async function run(prisma: PrismaClient) {
	const queries = [];

	for (const uni of universities) {
		queries.push(
			prisma.university.create({
				data: {
					name: uni.name,
					UniversityDomain: {
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
