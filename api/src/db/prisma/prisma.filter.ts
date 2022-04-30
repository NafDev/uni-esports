import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { Response } from 'express';
import { PrismaError } from '../../types/prisma';
import { classifyPrismaKnownError } from '../../util/prisma.errors';

@Catch(PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (classifyPrismaKnownError(exception)[0]) {
      case PrismaError.INVALID_REQUEST:
        this.logger.warn('Uncaught Prisma Error - INVALID_REQUEST', exception.stack);
        return response.status(HttpStatus.BAD_REQUEST).send();
      case PrismaError.NOT_FOUND:
        this.logger.warn('Uncaught Prisma Error - NOT_FOUND', exception.stack);
        return response.status(HttpStatus.NOT_FOUND).send();
      case PrismaError.CONSTRAINT_FAILED:
        this.logger.warn('Uncaught Prisma Error - CONSTRAINT_FAILED', exception.stack);
        return response.status(HttpStatus.CONFLICT).send();
      default:
        this.logger.error('Uncaught Prisma Error - INTERNAL_ERROR', exception.stack);
        return response.status(HttpStatus.INTERNAL_SERVER_ERROR).send();
    }
  }
}
