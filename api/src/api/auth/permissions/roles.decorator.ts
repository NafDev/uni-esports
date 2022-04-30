import { SetMetadata } from '@nestjs/common';
import { Roles as UserRoles } from '@uniesports/types';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRoles[]) => SetMetadata(ROLES_KEY, roles);
