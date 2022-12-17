import { PrismaClient } from '@prisma/client';
import { run as uniDomains } from './0-university-domains';
import { run as games } from './1-games';

const prisma = new PrismaClient();

async function main() {
	await uniDomains(prisma);
	await games(prisma);
}

main()
	.catch((error) => {
		console.error(error);
		throw error; // eslint-disable-line @typescript-eslint/no-throw-literal
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
