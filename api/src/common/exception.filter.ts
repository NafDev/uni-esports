import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ThrottlerException } from '@nestjs/throttler';
import { OgmaService } from '@ogma/nestjs-module';
import { capitalizeFirstLetter } from '../util/utility';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
	constructor(private readonly logger: OgmaService, private readonly httpAdapterHost: HttpAdapterHost) {}

	catch(exception: unknown, host: ArgumentsHost): void {
		const { httpAdapter } = this.httpAdapterHost;

		const ctx = host.switchToHttp();

		const request = ctx.getRequest();
		const correlationId = request.requestId;

		if (exception instanceof HttpException && exception.message?.length > 0) {
			this.logger.info(exception.message, { correlationId });
		} else if (exception instanceof Error) {
			this.logger.error(exception.message, exception.stack, { correlationId });
		} else {
			this.logger.fatal('Uncaught error', { correlationId, err: exception });
		}

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
