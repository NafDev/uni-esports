import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import type { IUniversityAdminView, IUniversity } from '@uni-esports/interfaces';
import type { SessionContainer } from 'supertokens-node/recipe/session';
import { classifyPrismaError, normalizeConflictError, PrismaError } from '../../db/prisma/prisma.errors';
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

	async changeUniName(newName: string, universityId: number, session: SessionContainer) {
		const name = newName.trim();

		try {
			await this.prisma.university.update({ where: { id: universityId }, data: { name } });

			this.logger.log(`Admin ${session.getUserId()} changed name to "${name}" for university ID ${universityId}`);
		} catch (error: unknown) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				classifyPrismaError(error)[0] === PrismaError.CONSTRAINT_FAILED
			) {
				const message = normalizeConflictError(error);
				if (message)
					throw new ConflictException(
						'Another university is already using this name.'
					);
			}

			throw error;
		}
	}

	async addUniDomain(newDomain: string, universityId: number, session: SessionContainer) {
		const domain = newDomain.trim().toLowerCase();
		if (!domain.endsWith('.ac.uk')) {
			throw new BadRequestException('University domain must end in .ac.uk');
		}

		try {
			await this.prisma.universityDomain.create({
				data: { domain, universityId },
				select: { universityId: true }
			});

			this.logger.log(`Admin ${session.getUserId()} added domain "${domain}" to university ID ${universityId}`);
		} catch (error: unknown) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				classifyPrismaError(error)[0] === PrismaError.CONSTRAINT_FAILED
			) {
				const message = normalizeConflictError(error);
				if (message)
					throw new ConflictException('This domain is already associated with this university, or another university.');
			
					throw error
				}

				throw error
		}
	}

	async removeUniDomain(domain: string, universityId: number, session: SessionContainer) {
		domain = domain.trim().toLowerCase();

		const [uniHasDomain, numberOfUniDomains] = await this.prisma.$transaction([
			this.prisma.universityDomain.count({ where: { universityId, domain } }),
			this.prisma.universityDomain.count({ where: { universityId } })
		]);

		if (uniHasDomain === 0) {
			throw new BadRequestException('Domain is not associated with provided university ID.');
		}

		if (numberOfUniDomains < 2) {
			throw new BadRequestException(
				'Cannot delete domain. University must have at least one more associated domain before deleting another domain.'
			);
		}

		await this.prisma.universityDomain.delete({ where: { domain_universityId: { domain, universityId } } });

		this.logger.log(`Admin ${session.getUserId()} deleted domain ${domain} from university ID ${universityId}`);
	}
}
