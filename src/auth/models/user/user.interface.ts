import { FeedPost } from 'src/feed/models/post.interface';
import { Role } from '../role';

export interface User {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  imagePath?: string;
  role?: Role;
  posts?: FeedPost[];
}

export interface UserLoginPayload {
  email: string;
  password: string;
}
