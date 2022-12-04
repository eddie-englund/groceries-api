import { ZodDefaultResponse } from '@util/zod-response';
import { optional, z } from 'zod';
import { ListItemUninitalized } from '../create-list/create-list-schema';

export const GetListSchema = z.object({
  id: z.string().trim().uuid(),
  username: z.optional(z.string().trim().min(1).max(64)),
});

export const GetListResponseSchema = z
  .object({
    data: z.optional(
      z.object({
        id: z.optional(z.string()),
        name: z.string(),
        url: optional(z.string()),
        imgUrl: optional(z.string()),
        items: z.array(ListItemUninitalized),
      }),
    ),
  })
  .merge(ZodDefaultResponse);
