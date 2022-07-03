import type { PrismaClient } from '@prisma/client';
import universities from './universities.json';

export async function run(prisma: PrismaClient) {
	for await (const uni of universities) {
		await prisma.university.create({
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
		});
	}
}
