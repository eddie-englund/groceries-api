import { z } from 'zod';
import { Stores } from '../lib/stores';

export const ListItem = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1).max(64),
  description: z.optional(z.string().trim().min(1).max(256)),
  price: z.optional(z.number().min(1).max(1024)),
  store: z.optional(Stores),
});

export const ListItemUninitalized = z.object({
  name: z.string().trim().min(1).max(64),
  description: z.optional(z.string().trim().min(1).max(256)),
  price: z.optional(z.number().min(1).max(1024)),
  store: z.optional(Stores),
});

export const CreateListSchema = z.object({
  name: z.string().min(1).max(64),
  items: z.array(ListItemUninitalized).min(1).max(512),
});
