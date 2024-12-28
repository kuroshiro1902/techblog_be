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
import { categorizePost } from './openai/service-helpers/categorizePost';

// syncPostToElasticSearchByBatch(100)

(async () => {
  console.log('RUN')
  const count = await updateMissingEmbeddingsByBatch(5).then(res => res.count)
  console.log({ count });
  // categorizePost('Bài viết tập trung vào 8 vấn đề phổ biến trong thiết kế hệ thống và các giải pháp tương ứng. Đầu tiên, hệ thống đọc nhiều có thể được giải quyết bằng cách sử dụng caching (Redis, Memcached) và nhân bản cơ sở dữ liệu. Ngược lại, hệ thống ghi nhiều nên sử dụng xử lý bất đồng bộ (RabbitMQ, Kafka) và cơ sở dữ liệu LSM-Tree (Cassandra). Điểm lỗi đơn cần được loại bỏ bằng cách triển khai nhiều bản sao và cơ chế chuyển đổi dự phòng. Tính sẵn sàng cao được đảm bảo bằng cân bằng tải (NGINX, AWS ELB) và sao chép dữ liệu. Độ trễ cao có thể giảm bằng CDN và điện toán biên. Việc xử lý tệp lớn có thể dùng block storage hoặc object storage (Amazon S3). Giám sát và cảnh báo cần thiết để phát hiện sự cố, với ELK stack và các công cụ như PagerDuty, Prometheus. Cuối cùng, tối ưu hóa truy vấn cơ sở dữ liệu chậm bằng cách thêm index và sharding. Bài viết kết luận rằng các thách thức trong thiết kế hệ thống là tất yếu, nhưng có thể được quản lý hiệu quả bằng các chiến lược phù hợp.\n')
  //   .then((categories) => {
  //     console.log({ categories })
  //   })
})()
