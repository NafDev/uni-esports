import { PrismaClient } from '@prisma/client';
import { Roles } from '@uniesports/types';

export async function run(client: PrismaClient) {
  await client.role.createMany({
    data: [
      { id: Roles.PLAYER, name: 'Player' },
      { id: Roles.CAPTAIN, name: 'Captain' },
      { id: Roles.USER_ADMIN, name: 'User Admin' },
    ],
  });
}
