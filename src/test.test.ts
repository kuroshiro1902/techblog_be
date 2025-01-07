import 'dotenv/config';

import server from './server/server';
import notificationServer from './notification/notification.server';
import io from './socket/io';
import { JobServer } from './search/jobs';
import { AddressInfo } from 'net';
import { updateExistEmbeddingsByBatch, updateMissingEmbeddingsByBatch, updateMissingEmbeddingsJob } from './search/jobs/updateMissingEmbedding.job';
import { findSimilarPosts } from './search/services-helpers/findSimilarPosts';
import { syncPostToElasticSearchByBatch, syncPostToElasticSearchJob } from './search/jobs/syncPostToElasticSearch.job';
import { delay } from './common/utils/delay';
import { categorizePost } from './openai/service-helpers/categorizePost';
import { DB, Elastic } from './database/database';
import { ENVIRONMENT } from './common/environments/environment';
import { categorizeWithAI } from './post/services/helpers/categorizeWithAI.helper';
import { summaryContent } from './openai/service-helpers/summaryContent';

// syncPostToElasticSearchByBatch(100);

// updateMissingEmbeddingsByBatch(5).then(({ count }) => {
//   console.log({ count });
// })

// const main = async () => {
//   const s = await Elastic?.search<{ categories: { id: number, name: string }[] }>({
//     query: {
//       match_all: {},
//     },
//     size: 300,
//     _source: ['categories'],
//     index: ENVIRONMENT.ELASTIC_POST_INDEX
//   });
//   const docs = s?.hits.hits.flatMap((c) => c._source?.categories).sort((a, b) => (a?.id ?? 0) - (b?.id ?? 0));

//   const catSet = new Set(docs?.map((v) => v ? `${v.id}-${v.name}` : 'null'));
//   console.log({ catSet });

//   const cats = await DB.category.findMany({ select: { id: true, name: true }, orderBy: { id: 'asc' } })
//   console.log('cats: ', (cats.map((c) => `${c.id}-${c.name}`)));

// }


const main = async () => {
  let count = 1;
  while (count > 0) {
    count = (await updateExistEmbeddingsByBatch(5)).count;
    console.log({ count });

    await delay(30000);
  }
}

main();
