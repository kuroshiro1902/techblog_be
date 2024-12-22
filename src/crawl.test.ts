import axios from 'axios';
import 'dotenv/config';
import { createPostSchema, EPostField } from './post/validators/post.schema';
import { z } from 'zod';
import { PostService } from './post/services/post.service';
import { DB } from './database/database';
import { getRandomValues } from './common/utils/getRandomValues.util';
import { delay } from './common/utils/delay';
import markdown from 'markdown-it'

const idsToIgnore = [79888, 79904, 79793, 75413, 79879, 79902, 79898, 79477, 79875];
const page = 9;
(async () => {
  const md = new markdown()
  const { data: res } = await axios.get('https://api.viblo.asia/posts?page=' + page);
  const rawPosts: any[] = res.data.filter((p: any) => {
    return !idsToIgnore.includes(p.id) && p.moderation !== 'pending'
  });
  const userIds = (await DB.user.findMany()).map(u => u.id);
  const posts: z.input<typeof createPostSchema>[] = rawPosts.map((p: any) => {
    return {
      title: p.title,
      // description: p.contents_short,
      isPublished: true,
      thumbnailUrl: p.thumbnail_url ?? null,
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
    const p = await PostService.createOne(post, getRandomValues(userIds, 1)[0]);
    console.log(p.slug);
    await delay(1000);
  }
})()