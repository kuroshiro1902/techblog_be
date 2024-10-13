import { PrismaClient } from '@prisma/client';

const DB = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

export { DB };
