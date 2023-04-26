import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../role';
import { FeedPostEntity } from 'src/feed/models/post.entity';
import { TokenEntity } from '../tokens/token.entity';
import { FriendConnectionEntity } from 'src/connections/friend-connection/models/friend-connection.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  imagePath: string;

  @Column({ nullable: true })
  fileId: string;

  @Column({ nullable: true })
  fileName: string;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @OneToMany(() => FeedPostEntity, (feedPostEntity) => feedPostEntity.author)
  feedPosts: FeedPostEntity[];

  @OneToMany(() => TokenEntity, (token) => token.user)
  tokens: TokenEntity[];

  @OneToMany(
    () => FriendConnectionEntity,
    (friendConnectionEntity) => friendConnectionEntity.creator,
  )
  sentFriendConnection: FriendConnectionEntity[];

  @OneToMany(
    () => FriendConnectionEntity,
    (friendConnectionEntity) => friendConnectionEntity.receiver,
  )
  recieveFriendConnection: FriendConnectionEntity[];
}
