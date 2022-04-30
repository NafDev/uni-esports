import { Controller, Get, UseGuards } from '@nestjs/common';
import { Roles as UserRoles } from '@uniesports/types';
import { AuthGuard } from '../../auth/auth.guard';
import { Roles } from '../../auth/permissions/roles.decorator';
import { RolesGuard } from '../../auth/permissions/roles.guard';

@UseGuards(AuthGuard, RolesGuard)
@Roles(UserRoles.USER_ADMIN)
@Controller('admin/users')
export class UsersController {
  @Get('test')
  testAdminRoute() {
    return 'Hello';
  }
}
