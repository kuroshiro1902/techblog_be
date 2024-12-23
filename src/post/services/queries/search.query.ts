import {
  paginationOptions,
  paginationSchema,
  TPageInfo,
} from '@/common/models/pagination/pagination.model';
import { DB, Elastic } from '@/database/database';
import { categorySchema, ECategoryField } from '@/category/validators/category.schema';
import {
  EPostField,
  POST_PUBLIC_FIELDS,
  postFieldSchema,
  postSchema,
  TPost,
} from '@/post/validators/post.schema';
import { EUserField, userSchema } from '@/user/validators/user.schema';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { ERatingScore } from '@/post/constants/rating-score.const';
import { TRatingInfo } from '@/post/validators/ratingInfo.schema';
import { ENVIRONMENT } from '@/common/environments/environment';
import { TPost_S } from '@/search/models/post.s.model';

const searchPostQuerySchema = z.object({
  fields: z.array(postFieldSchema).default(POST_PUBLIC_FIELDS),
  input: z.object({
    slug: z.string().trim().max(255).optional(),
    search: z.string().trim().max(255, 'Tìm kiếm tối đa 255 ký tự').toLowerCase().default(''),
    categoryIds: z.array(categorySchema.shape[ECategoryField.id]).default([]),
    authorId: userSchema.shape[EUserField.id].optional(),
    isPublished: postSchema.shape.isPublished,
  }),
  orderBy:
    z.object({
      field: z.enum([EPostField.id, EPostField.createdAt, EPostField.views]).default(EPostField.createdAt),
      order: z.nativeEnum(Prisma.SortOrder).default(Prisma.SortOrder.desc),
    })
      .default({ field: EPostField.createdAt, order: Prisma.SortOrder.desc }),
  ...paginationSchema.shape,
});


export type TSearchPostQuery = Partial<z.input<typeof searchPostQuerySchema>>;

export const searchPosts = async (query?: TSearchPostQuery): Promise<{ data: TPost[], pageInfo: TPageInfo }> => {
  const validatedQuery = searchPostQuerySchema.parse(query);
  const {
    input,
    fields,
    pageIndex: _pageIndex,
    pageSize: _pageSize,
    orderBy: orderCondition,
  } = validatedQuery;

  const { pageIndex, pageSize, skip } = paginationOptions({
    pageIndex: _pageIndex,
    pageSize: _pageSize,
  });

  if (!Elastic) {
    throw new Error('Elasticsearch is not available');
  }

  // Build Elasticsearch query
  const must: any[] = [];
  const filter: any[] = [];

  // Handle search
  if (input.search) {
    must.push({
      multi_match: {
        query: input.search,
        fields: ['title^2', 'content', /*'author.name', 'categories.name'*/],
        fuzziness: 'AUTO'
      }
    });
  }

  // Handle filters
  if (typeof input.isPublished === 'boolean') {
    filter.push({ term: { isPublished: input.isPublished } });
  }

  if (input.authorId) {
    filter.push({ term: { 'author.id': input.authorId } });
  }

  if (input.categoryIds.length > 0) {
    filter.push({
      terms: { 'categories.id': input.categoryIds }
    });
  }

  if (input.slug) {
    filter.push({ term: { slug: input.slug } });
  }

  // Execute Elasticsearch search
  const { hits } = await Elastic.search<TPost_S>({
    index: ENVIRONMENT.ELASTIC_POST_INDEX,
    query: {
      bool: {
        must,
        filter
      }
    },
    sort: [
      { _score: { order: 'desc' } },
      { [orderCondition.field]: orderCondition.order.toLowerCase() }
    ],
    _source: fields,
    from: skip,
    size: pageSize
  });

  const posts = hits.hits.map(hit => hit._source).filter((p) => !!p);
  const totalCount = typeof hits.total === 'number' ? hits.total : hits.total?.value ?? 0;
  const totalPage = Math.ceil(totalCount / pageSize);
  const hasNextPage = skip + posts.length < totalCount;

  return {
    data: posts.map((p) => ({
      ...p,
      description: p.description ?? '',
      categories: p.categories || [],
      // Sử dụng trực tiếp ratings từ Elasticsearch
      rating: p.ratings
    })),
    pageInfo: {
      pageIndex,
      pageSize,
      hasNextPage,
      totalPage,
    },
  };
};