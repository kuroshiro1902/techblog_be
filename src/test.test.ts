import 'dotenv/config';

import server from './server/server';
import notificationServer from './notification/notification.server';
import io from './socket/io';
import { JobServer } from './search/jobs';
import { AddressInfo } from 'net';
import { updateMissingEmbeddingsByBatch, updateMissingEmbeddingsJob } from './search/jobs/updateMissingEmbedding.job';
import { findSimilarPosts } from './search/services-helpers/findSimilarPosts';
import { syncPostToElasticSearchByBatch, syncPostToElasticSearchJob } from './search/jobs/syncPostToElasticSearch.job';
import { delay } from './common/utils/delay';

// syncPostToElasticSearchByBatch(100)

(async () => {
  console.log('RUN')
  const count = await updateMissingEmbeddingsByBatch(5).then(res => res.count)
  console.log({ count });
})()
