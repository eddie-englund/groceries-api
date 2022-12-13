import { ListItem } from '@routes/lists/create-list/create-list-schema';
import { ZodDefaultResponse } from '@util/zod-response';
import { z } from 'zod';

export const GetAllUsersSchema = z
  .object({
    data: z.array(
      z.object({
        username: z.string(),
        lists: z.array(
          z.object({
            id: z.string(),
            createdAt: z.string(),
            name: z.string(),
            items: z.array(ListItem),
          }),
        ),
      }),
    ),
  })
  .merge(ZodDefaultResponse);
