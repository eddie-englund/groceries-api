import { Stores } from '@routes/lists/lib/stores';
import { z } from 'zod';

export interface ListItem {
  name: string;
  description?: string;
  price?: number;
  store: z.infer<typeof Stores>;
}

export interface List {
  name: string;
  url?: string;
  imgUrl?: string;
  items: ListItem[];
}
