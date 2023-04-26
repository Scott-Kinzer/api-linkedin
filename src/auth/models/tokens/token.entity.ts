import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Entity('token')
export class TokenEntity {
  @PrimaryColumn()
  @JoinColumn()
  userEntity: string;

  @Column()
  refreshToken: string;

  @Column()
  accessToken: string;

  @ManyToOne(() => UserEntity, (user) => user.tokens)
  @JoinColumn({ name: 'userEntity' })
  user: UserEntity;
}
