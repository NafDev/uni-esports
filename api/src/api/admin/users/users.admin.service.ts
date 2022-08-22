import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../db/prisma/prisma.service';
import type { UserFiltersDto } from './users.admin.dto';

@Injectable()
export class UserService {
	constructor(private readonly prisma: PrismaService) {}

	async findAllUsers(page: number, filters: UserFiltersDto) {
		const where = {
			email: filters.email ? { startsWith: filters.email } : undefined,
			username: filters.username ? { startsWith: filters.username } : undefined
		};

		return this.prisma.user.findMany({
			where,
			select: { id: true, email: true, username: true },
			take: 20,
			skip: 20 * (page - 1)
		});
	}

	async findUser(id: string) {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: {
				createdAt: true,
				discordId: true,
				steam64Id: true,
				email: true,
				id: true,
				verified: true,
				University: { select: { name: true } }
			}
		});

		if (!user) throw new NotFoundException();

		return user;
	}

	async unlinkSteamId(userId: string) {
		const resp = await this.prisma.user.update({
			where: { id: userId },
			data: { steam64Id: null },
			select: { _count: true }
		});

		return resp._count;
	}
}
