export DATABASE_URI="postgresql://prisma:prisma@localhost:5433/tests"
prisma migrate deploy
prisma db seed