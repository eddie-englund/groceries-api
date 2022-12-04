import { ListItemUninitalized } from '@routes/lists/create-list/create-list-schema';
import { Stores } from '@routes/lists/lib/stores';
import { ZodDefaultResponse } from '@util/zod-response';
import { z } from 'zod';

export const GetAllUsersSchema = z
  .object({
    data: z.array(
      z.object({
        username: z.string(),
        lists: z.array(
          z.object({
            name: z.string(),
            store: z.optional(Stores),
            items: z.array(ListItemUninitalized),
          }),
        ),
      }),
    ),
  })
  .merge(ZodDefaultResponse);
