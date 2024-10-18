import { PrismaClient } from '@prisma/client';

const DB = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });
// @ts-ignore
DB.$on('query', (e: any) => {
  console.log('Params: ' + e.params);
  console.log('Duration: ' + e.duration + 'ms');
});

export { DB };
