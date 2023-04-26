import { User } from 'src/auth/models/user/user.interface';

export type FriendStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'waiting-for-current-user-response'
  | 'not-sent';

export interface FriendConnectionStatus {
  status?: FriendStatus;
}

export interface FriendConnection {
  id?: string;
  creator?: User;
  receiver: User;
  status: FriendStatus;
}
