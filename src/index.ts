import 'dotenv/config';

import server from './server/server';
import notificationServer from './notification/notification.server';
import io from './socket/io';
import { JobServer } from './search/jobs';
import { AddressInfo } from 'net';
import { updateMissingEmbeddingsByBatch, updateMissingEmbeddingsJob } from './search/jobs/updateMissingEmbedding.job';
import { findSimilarPosts } from './search/services-helpers/findSimilarPosts';

 server.listen(4537, () => {
   const { address, port } = server.address() as AddressInfo;
   console.log(`Server is running on ${address}:${port}`);
 });

 io.listen(4538)
// JobServer()

//findSimilarPosts(5, 5).then((post) => {
//  console.log(post.map(p => ({ id: p.id, title: p.title, //score: p.score, views: p.views })))
//})