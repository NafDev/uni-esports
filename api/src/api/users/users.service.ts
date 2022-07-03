import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { hash } from 'bcrypt';
import appConfig from '../../config/app.config';
import { classifyPrismaError, normalizeConflictError, PrismaError } from '../../db/prisma/prisma.errors';
import { PrismaService } from '../../db/prisma/prisma.service';
import type { CreateUserDto, UserInfoDto } from './users.dto';

@Injectable()
export class UserService {
	private readonly logger = new Logger(UserService.name);

	constructor(private readonly prisma: PrismaService) {}

	async createUser(createUserDto: CreateUserDto) {
		const emailDomain = createUserDto.email.split('@').at(1);

		if (emailDomain === undefined) {
			throw new BadRequestException('Unknown university email domain');
		}

		const uni = await this.prisma.universityDomain.findUnique({
			where: { domain: emailDomain },
			select: { universityId: true }
		});

		if (uni === null) {
			throw new BadRequestException('Unknown university email domain');
		}

		try {
			await this.prisma.user.create({
				data: {
					email: createUserDto.email.toLowerCase(),
					username: createUserDto.username,
					passwordHash: await hash(createUserDto.password, appConfig.PASSWORD_SALT_ROUNDS),
					roles: 'USER',
					universityId: uni.universityId
				}
			});
		} catch (error: unknown) {
			if (
				error instanceof PrismaClientKnownRequestError &&
				classifyPrismaError(error)[0] === PrismaError.CONSTRAINT_FAILED
			) {
				const message = normalizeConflictError(error);
				if (message) throw new ConflictException(message);
			}

			throw error;
		}
	}

	async getUserInfo(id: string): Promise<UserInfoDto> {
		const user = await this.prisma.user.findUnique({
			where: { id },
			select: { email: true, id: true, University: true }
		});

		if (!user) throw new NotFoundException('User not found');

		return user;
	}
}
