import { ListItem } from '@routes/lists/create-list/create-list-schema';
import { Stores } from '@routes/lists/lib/stores';
import { ZodDefaultResponse } from '@util/zod-response';
import { z } from 'zod';

export const GetUserSchema = z.object({
  username: z.string().min(1).max(64),
});

export const GetUserResponseShema = z
  .object({
    data: z.object({
      username: z.string(),
      lists: z.array(
        z.object({
          id: z.string(),
          createdAt: z.string(),
          name: z.string(),
          store: z.optional(Stores),
          items: z.array(ListItem),
        }),
      ),
    }),
  })
  .merge(ZodDefaultResponse);
