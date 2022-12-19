import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import type { Response } from 'express';
import { LoggerService } from '../../common/logger-wrapper';
import { classifyPrismaError, PrismaError } from './prisma.errors';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
	private readonly logger = new LoggerService(PrismaExceptionFilter.name);

	catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();

		const classedError = classifyPrismaError(exception) ?? [undefined];

		switch (classedError[0]) {
			case PrismaError.INVALID_REQUEST:
				this.logger.error(
					'Uncaught Prisma Error',
					{ type: 'INVALID_REQUEST', message: exception.message },
					exception.stack
				);
				return response.status(HttpStatus.BAD_REQUEST).send();
			case PrismaError.NOT_FOUND:
				this.logger.error('Uncaught Prisma Error', { type: 'NOT_FOUND', message: exception.message }, exception.stack);
				return response.status(HttpStatus.NOT_FOUND).send();
			case PrismaError.CONSTRAINT_FAILED:
				this.logger.error(
					'Uncaught Prisma Error',
					{ type: 'CONSTRAINT_FAILED', message: exception.message },
					exception.stack
				);
				return response.status(HttpStatus.CONFLICT).send();
			default:
				this.logger.error(
					'Uncaught Prisma Error',
					{ type: 'INTERNAL_ERROR', message: exception.message },
					exception.stack
				);
				return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
		}
	}
}
