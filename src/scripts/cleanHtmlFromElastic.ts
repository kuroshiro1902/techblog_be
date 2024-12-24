import dotenv from 'dotenv';
dotenv.config();
import { Elastic } from "@/database/database";
import { removeHtml } from "@/common/utils/removeHtml.util";
import { Logger } from "@/common/utils/logger.util";

async function cleanHtmlFromElastic() {
  if (!Elastic) {
    console.error('Elasticsearch client not initialized');
    return;
  }

  try {
    // Lấy tất cả documents từ index posts
    const { hits } = await Elastic.search({
      index: 'techblog_posts',
      size: 10000, // Điều chỉnh số lượng nếu cần
      query: {
        match_all: {}
      }
    });

    console.log(`Found ${hits.hits.length} posts to clean`);

    // Xử lý từng document
    for (const hit of hits.hits) {
      const post = hit._source;

      // Loại bỏ HTML từ content
      const cleanContent = removeHtml((post as any).content);

      // Update lại document
      await Elastic.update({
        index: 'techblog_posts',
        id: hit._id!,
        body: {
          doc: {
            content: cleanContent,
          }
        }
      });

      console.log(`Cleaned post ${hit._id}`);
    }

    console.log('Finished cleaning HTML from all posts');

  } catch (error) {
    await Logger.error('Error cleaning HTML from Elastic:' + JSON.stringify(error));
    console.error('Error:', error);
  }
}

// Chạy script
cleanHtmlFromElastic()
  .catch(console.error)
  .finally(() => {
    console.log('Script completed');
    process.exit(0);
  }); 