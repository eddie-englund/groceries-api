import { ObjectId } from 'mongodb';
import { ListEntry } from './list-model';

export interface User {
  _id: ObjectId;
  username: string;
  email: string;
  password: string;
  lists: ListEntry[];
}
