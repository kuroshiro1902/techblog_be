import 'dotenv/config';

import server from './server/server';
import notificationServer from './notification/notification.server';
import io from './socket/io';
import { JobServer } from './search/jobs';
import { AddressInfo } from 'net';
import { updateMissingEmbeddingsByBatch, updateMissingEmbeddingsJob } from './search/jobs/updateMissingEmbedding.job';
import { findSimilarPosts } from './search/services-helpers/findSimilarPosts';
import { syncPostToElasticSearchByBatch, syncPostToElasticSearchJob } from './search/jobs/syncPostToElasticSearch.job';

// syncPostToElasticSearchByBatch(100)

updateMissingEmbeddingsByBatch(5).then(res => {
  console.log(res)
})
