import axios from 'axios';
import 'dotenv/config';
import { createPostSchema, EPostField } from './post/validators/post.schema';
import { z } from 'zod';
import { PostService } from './post/services/post.service';
import { DB } from './database/database';
import { getRandomValues } from './common/utils/getRandomValues.util';
import { delay } from './common/utils/delay';
import markdown from 'markdown-it'

const randomImages = ['https://irpp.org/wp-content/uploads/2021/01/Facebook-Are-New-Technologies-Changing-the-Nature-of-Work.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqh-XpWAkI5y-Tp8KoDkTDlmNZ0pwQK_epGw&s',
  'https://www.ishir.com/wp-content/uploads/2022/11/Emerging-technology-Trends-2023-ISHIR.png',
  'https://images.squarespace-cdn.com/content/v1/5ee9d7174fe4b3735b906f0f/1597312166947-BGEO7T9QB1HZEIX1A679/w-500_h-300_m-cover_s-any__EmergingTechnologies.png?format=500w',
  'https://vnrv.s3.hn-1.cloud.cmctelecom.vn/data/attachments/26/26326-0e65915de734d619fe37744883057b19.jpg',
  'https://akm-img-a-in.tosshub.com/indiatoday/images/story/201810/stockvault-person-studying-and-learning---knowledge-concept178241_0.jpeg'
];

const pages = Array.from({ length: 10 }, (_, i) => i + 392);

(async () => {
  const md = new markdown();
  for (const page of pages) { // #1
    console.log({ page });

    const { data: res } = await axios.get('https://api.viblo.asia/posts?limit=5&page=' + page);
    const rawPosts: any[] = res.data.filter((p: any) => {
      return md.render(p.contents).length <= 4500 && p.moderation !== 'pending' && !p.title.toLowerCase().includes('viblo') && p.system !== 'announcements'
    });
    const userIds = (await DB.user.findMany()).map(u => u.id);
    const posts: z.input<typeof createPostSchema>[] = rawPosts.map((p: any) => {
      return {
        title: p.title,
        // description: p.contents_short,
        isPublished: true,
        thumbnailUrl: getRandomValues(randomImages, 1)[0],
        // slug: string
        content: md.render(p.contents),
        // thumbnailUrl?: string | null
        // isPublished?: boolean | null
        views: p.views_count ?? 0,
        createdAt: new Date(p.published_at)
        // updatedAt?: Date | string
        // currentVersion?: number
        // categories?: CategoryCreateNestedManyWithoutPostsInput
        // comments?: CommentCreateNestedManyWithoutPostInput
        // ratings?: RatingCreateNestedManyWithoutPostInput
        // author: UserCreateNestedOneWithoutPostsInput
        // PostLog?: PostLogCreateNestedManyWithoutPostInput
        // revisions?: PostRevisionCreateNestedManyWithoutPostInput
      }
    });

    for (const post of posts) {
      const p = await PostService.createOne(post, getRandomValues(userIds, 1)[0], true);
      console.log(p.slug);
      await delay(1000);
    }

    await delay(60000)
  }
})()