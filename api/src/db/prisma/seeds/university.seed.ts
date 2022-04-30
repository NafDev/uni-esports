import { PrismaClient } from '@prisma/client';
import data from './universities.json';

export async function run(client: PrismaClient) {
  // Insert university email domains
  type domainEntry = {
    domain: string;
    university: string;
  };

  const domainEntries: domainEntry[] = [];

  for (const entry of data) {
    entry.domains.forEach((domain) =>
      domainEntries.push({
        domain,
        university: entry.name,
      }),
    );
  }

  await client.$transaction(
    domainEntries.map((entry) =>
      client.emailDomain.create({
        data: {
          domain: entry.domain,
          university: {
            connectOrCreate: {
              where: {
                name: entry.university,
              },
              create: {
                name: entry.university,
              },
            },
          },
        },
      }),
    ),
  );
}
