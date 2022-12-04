import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ThrottlerException } from '@nestjs/throttler';
import { capitalizeFirstLetter } from '../util/utility';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	private readonly logger = new Logger(AllExceptionsFilter.name);

	constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		if (exception instanceof HttpException) {
			this.logger.error('Request error', exception.stack);
		} else {
			this.logger.error('Uncaught error', exception);
		}

		const { httpAdapter } = this.httpAdapterHost;

		const ctx = host.switchToHttp();

		const httpStatus = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

		let responseBody;

		if (exception instanceof HttpException) {
			const exceptionResp = exception.getResponse();

			responseBody =
				typeof exceptionResp === 'string'
					? { message: exceptionResp }
					: { ...exceptionResp, statusCode: undefined, error: undefined };
		}

		if (exception instanceof ThrottlerException) {
			responseBody = { message: 'Too many requests' };
		}

		responseBody = { ...responseBody, message: capitalizeFirstLetter(responseBody?.message) };

		httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
	}
}
