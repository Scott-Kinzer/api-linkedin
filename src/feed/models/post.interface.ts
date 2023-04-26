import { User } from 'src/auth/models/user/user.interface';

export interface FeedPost {
  id?: string;
  body?: string;
  createdAt?: Date;
  author: User;
}

export interface FeedPostPayload {
  body: string;
}
