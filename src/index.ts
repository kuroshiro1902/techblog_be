import 'dotenv/config';

import server from './server/server';
import notificationServer from './notification/notification.server';
import io from './socket/io';
import { JobServer } from './search/jobs';

server.listen(4537, () => {
  console.log('listening on port 4537');
});

io.listen(4538)
// JobServer()
