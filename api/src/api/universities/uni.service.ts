import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { IUniversityAdminView, IUniversity } from '@uni-esports/interfaces';
import { PrismaService } from '../../db/prisma/prisma.service';

@Injectable()
export class UniversityService {
	private readonly logger = new Logger(UniversityService.name);

	constructor(private readonly prisma: PrismaService) {}

	async getUniversities(): Promise<IUniversity[]> {
		return this.prisma.university.findMany({
			select: { id: true, name: true }
		});
	}

	async getUniversityDetails(id: number): Promise<IUniversity & IUniversityAdminView> {
		const resp = await this.prisma.university.findUnique({
			where: { id },
			select: {
				id: true,
				name: true,
				UniversityDomain: { select: { domain: true } }
			}
		});

		if (!resp) {
			throw new NotFoundException('Could not find university with this ID');
		}

		return {
			id: resp.id,
			name: resp.name,
			domains: resp.UniversityDomain.map((domainKey) => domainKey.domain)
		};
	}
}
