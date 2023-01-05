import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { OgmaService } from '@ogma/nestjs-module';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import type { Response } from 'express';
import { classifyPrismaError, PrismaError } from './prisma.errors';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
	constructor(private readonly logger: OgmaService) {}

	catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const request = ctx.getRequest();
		const correlationId = request.requestId;

		const response = ctx.getResponse<Response>();

		const classedError = classifyPrismaError(exception) ?? [undefined];

		switch (classedError[0]) {
			case PrismaError.INVALID_REQUEST:
				this.logger.warn('Uncaught Prisma Error', { err: exception, correlationId });
				return response.status(HttpStatus.BAD_REQUEST).send();
			case PrismaError.NOT_FOUND:
				this.logger.warn('Uncaught Prisma Error', { err: exception, correlationId });
				return response.status(HttpStatus.NOT_FOUND).send();
			case PrismaError.CONSTRAINT_FAILED:
				this.logger.warn('Uncaught Prisma Error', { err: exception, correlationId });
				return response.status(HttpStatus.CONFLICT).send();
			default:
				this.logger.error(exception.message, exception.stack, { correlationId });
				return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
		}
	}
}
