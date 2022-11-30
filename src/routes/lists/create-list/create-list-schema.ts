import { z } from 'zod';
import { Stores } from '../lib/stores';

export const ListItem = z
  .object({
    name: z.string().trim().min(1).max(64),
    description: z.string().trim().min(1).max(256).optional(),
    price: z.number().min(1).max(1024).optional(),
    store: Stores,
  })
  .required();

export const CreateListSchema = z.object({
  name: z.string().min(1).max(64),
  items: z.array(ListItem).min(1).max(512),
});
