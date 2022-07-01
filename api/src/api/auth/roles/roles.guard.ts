import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { Role, AccessTokenPayload } from '@uni-esports/interfaces';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private readonly reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
			context.getHandler(),
			context.getClass()
		]);
		if (requiredRoles.length === 0) {
			return true;
		}

		const request: Request = context.switchToHttp().getRequest();
		const payload: AccessTokenPayload = request.session?.getAccessTokenPayload();

		if (!payload || payload.roles === undefined) {
			return false;
		}

		const payloadRoles = payload.roles;

		return requiredRoles.every((role) => payloadRoles.includes(role));
	}
}
