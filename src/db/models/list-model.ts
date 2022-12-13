import { Stores } from '@routes/lists/lib/stores';
import { z } from 'zod';

export interface ListItem {
  id: string;
  name: string;
  description?: string;
  price?: number;
  store?: z.infer<typeof Stores>;
}

export interface List {
  id: string;
  name: string;
  createdAt: string;
  url?: string;
  imgUrl?: string;
  items: ListItem[];
}
