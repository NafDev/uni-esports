import type { Prisma, PrismaClient } from '@prisma/client';
import universities from './data/universities.json';

export async function run(prisma: PrismaClient) {
	const queries = [];

	for (const uni of universities) {
		const domains:
			| Prisma.UniversityDomainUncheckedCreateNestedManyWithoutUniversityInput
			| Prisma.UniversityDomainCreateNestedManyWithoutUniversityInput
			| undefined = uni.domains
			? {
					createMany: {
						data: uni.domains.map((domain) => ({ domain })),
						skipDuplicates: true
					}
			  }
			: undefined;

		queries.push(
			prisma.university.create({
				data: {
					name: uni.name,
					domains
				}
			})
		);
	}

	await prisma.$transaction(queries);
}
