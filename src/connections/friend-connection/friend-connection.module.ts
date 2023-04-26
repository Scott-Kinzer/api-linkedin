import { Module } from '@nestjs/common';
import { FriendConnectionService } from './services/friend-connection.service';
import { FriendConnectionController } from './controllers/friend-connection.controller';
import { FriendConnectionEntity } from './models/friend-connection.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/models/user/user.entity';
import { UserService } from 'src/user/services/user.service';

@Module({
  controllers: [FriendConnectionController],
  providers: [FriendConnectionService, UserService],
  imports: [TypeOrmModule.forFeature([UserEntity, FriendConnectionEntity])],
})
export class FriendConnectionModule {}
