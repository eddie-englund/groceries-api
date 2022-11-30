import { List } from './list-model';

export interface User {
  username: string;
  email: string;
  password: string;
  lists: List[];
}
