import 'dotenv/config';

import server from './server/server';
import notificationServer from './notification/notification.server';
import io from './socket/io';
import { JobServer } from './search/jobs';
import { AddressInfo } from 'net';
import { updateMissingEmbeddingsByBatch, updateMissingEmbeddingsJob } from './search/jobs/updateMissingEmbedding.job';

server.listen(4537, () => {
  const { address, port } = server.address() as AddressInfo;
  console.log(`Server is running on ${address}:${port}`);
});

io.listen(4538)
JobServer()
