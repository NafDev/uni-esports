import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { AccessTokenPayload } from '@uni-esports/interfaces';
import type { Request } from 'express';

@Injectable()
export class VerifiedGuard implements CanActivate {
	canActivate(context: ExecutionContext): boolean {
		const request: Request = context.switchToHttp().getRequest();
		const payload: AccessTokenPayload = request.session?.getAccessTokenPayload();

		if (!payload || payload.pendingEmailVerification) {
			throw new BadRequestException('You must verify your email address before you can perform this action');
		}

		return true;
	}
}
