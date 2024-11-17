import { ENVIRONMENT } from '@/common/environments/environment';
import { Client as ElasticClient } from '@elastic/elasticsearch';
import { PrismaClient } from '@prisma/client';

// const log = ['query', 'info', 'warn', 'error']
const DB = new PrismaClient({ log: [] });
// @ts-ignore
DB.$on('query', (e: any) => {
  console.log('Params: ' + e.params);
  console.log('Duration: ' + e.duration + 'ms');
});

const Elastic: ElasticClient | undefined =
  new ElasticClient({
    node: ENVIRONMENT.ELASTIC_NODE,
    auth: {
      username: ENVIRONMENT.ELASTIC_AUTH_USERNAME,
      password: ENVIRONMENT.ELASTIC_AUTH_PASSWORD
    },
  });
// undefined
export { DB, Elastic };
