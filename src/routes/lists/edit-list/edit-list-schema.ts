import { z } from 'zod';
import { ListItem } from '../create-list/create-list-schema';

export const EditListSchema = z.object({
  listId: z.string().uuid(),
  name: z.string().min(1).max(64),
  items: z.array(ListItem),
});
