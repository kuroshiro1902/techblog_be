import axios from 'axios';
import 'dotenv/config';
import { createPostSchema, EPostField } from './post/validators/post.schema';
import { z } from 'zod';
import { PostService } from './post/services/post.service';
import { DB } from './database/database';
import { getRandomValues } from './common/utils/getRandomValues.util';
import { delay } from './common/utils/delay';
import markdown from 'markdown-it'

(async () => {
  const md = new markdown()
  const { data: res } = await axios.get('https://api.viblo.asia/posts');
  const rawPosts: any[] = res.data;
  const userIds = (await DB.user.findMany()).map(u => u.id);
  const posts: z.input<typeof createPostSchema>[] = rawPosts.slice(2).map((p: any) => {
    return {
      title: p.title,
      // description: p.contents_short,
      isPublished: true,
      thumbnailUrl: p.thumbnail_url,
      // slug: string
      content: md.render(p.contents)
      // thumbnailUrl?: string | null
      // isPublished?: boolean | null
      // views?: number
      // createdAt?: Date | string
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