import { ENVIRONMENT } from '@/common/environments/environment';
import pg, { Pool } from 'pg';

export type TQueryTextOrConfig = string | pg.QueryConfig<any[]>;

export const DB = new Pool({
  connectionString: ENVIRONMENT.db.uri,
  query_timeout: 3000,
});

async function run() {
  try {
    if (!.uri) throw new Error('Invalid database URI!');
    await DB.connect();
    console.log('Successfully connected to database!');
  } catch (err: any) {
    console.error(err);
  }
}

export default {
  run,
  query: async <T extends pg.QueryResultRow>(
    queryTextOrConfig: TQueryTextOrConfig,
    values?: any[] | undefined
  ) => {
    return (await DB.query<T>(queryTextOrConfig, values)).rows;
  },
  count: async (
    queryTextOrConfig: TQueryTextOrConfig,
    values?: any[] | undefined
  ): Promise<number> => {
    const result = await DB.query(queryTextOrConfig, values);
    return result.rowCount || 0;
  },
  /**
   * Should end with 'LIMIT 1' for better performance;
   */
  queryOne: async <T extends pg.QueryResultRow>(
    queryTextOrConfig: TQueryTextOrConfig,
    values?: any[] | undefined
  ) => {
    return (await DB.query(queryTextOrConfig, values))?.rows?.[0] as
      | T
      | undefined;
  },
};
