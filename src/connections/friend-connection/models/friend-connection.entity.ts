import { UserEntity } from 'src/auth/models/user/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { FriendStatus } from './friend-connection.interfaces';

@Entity('connection')
export class FriendConnectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.sentFriendConnection)
  creator: UserEntity;

  @ManyToOne(
    () => UserEntity,
    (userEntity) => userEntity.recieveFriendConnection,
  )
  receiver: UserEntity;

  @Column()
  status: FriendStatus;
}
