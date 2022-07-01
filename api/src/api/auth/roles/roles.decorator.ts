import { SetMetadata } from '@nestjs/common';
import type { Role } from '@uni-esports/interfaces';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
