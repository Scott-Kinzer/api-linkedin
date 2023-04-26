import { Injectable, NotFoundException } from '@nestjs/common';
import {
  FriendConnection,
  FriendConnectionStatus,
  FriendStatus,
} from '../models/friend-connection.interfaces';
import { User } from 'src/auth/models/user/user.interface';
import { Repository } from 'typeorm';
import { FriendConnectionEntity } from '../models/friend-connection.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/models/user/user.entity';
import { UserService } from 'src/user/services/user.service';

@Injectable()
export class FriendConnectionService {
  constructor(
    @InjectRepository(FriendConnectionEntity)
    private readonly friendConnectionRepo: Repository<FriendConnectionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    private userService: UserService,
  ) {}

  hasBeenSentOrReceived(
    creator: User,
    receiver: User,
  ): Promise<FriendConnectionEntity> {
    return this.friendConnectionRepo.findOne({
      where: [
        {
          creator,
          receiver,
        },
        {
          creator: receiver,
          receiver: creator,
        },
      ],
    });
  }

  async sendFriendRequest(
    receiverId: string,
    creator: User,
  ): Promise<FriendConnection> {
    const receiver = await this.userService.getUserInfo(receiverId);
    const userInfo = await this.userService.getUserInfo(creator.id);

    const isAlreadyRequested = await this.hasBeenSentOrReceived(
      receiver,
      userInfo,
    );

    if (isAlreadyRequested) {
      throw new NotFoundException('Already requested');
    }

    const friendRequest: FriendConnection = {
      creator: userInfo,
      receiver,
      status: 'pending',
    };

    return this.friendConnectionRepo.save(friendRequest);
  }

  async getFriendRequestStatus(
    receiverId: string,
    user: User,
  ): Promise<FriendConnectionStatus> {
    const receiver = await this.userService.getUserInfo(receiverId);
    const userInfo = await this.userService.getUserInfo(user.id);

    return this.friendConnectionRepo
      .findOne({
        where: [
          {
            creator: userInfo,
            receiver: receiver,
          },
          {
            creator: receiver,
            receiver: userInfo,
          },
        ],
        relations: ['creator', 'receiver'],
      })
      .then((friendsConnection) => {
        if (!friendsConnection) {
          return {
            status: 'not-sent',
          };
        }
        if (friendsConnection.receiver.id === userInfo.id) {
          return {
            id: friendsConnection.id,
            status: 'waiting-for-current-user-response',
          };
        }
        return {
          id: friendsConnection.id,
          status: friendsConnection.status,
        };
      });
  }

  getFriendRequestUserById(friendRequestId: string): Promise<FriendConnection> {
    return this.friendConnectionRepo.findOne({
      where: {
        id: friendRequestId,
      },
    });
  }

  async respondToFriendRequest(
    statusResponse: FriendStatus,
    friendRequestId: string,
  ): Promise<FriendConnectionStatus> {
    const friendConnection = await this.getFriendRequestUserById(
      friendRequestId,
    );

    const acceptedConnection = await this.friendConnectionRepo.save({
      ...friendConnection,
      status: statusResponse,
    });

    return acceptedConnection;
  }

  async getFriendRequests(user: User): Promise<FriendConnection[]> {
    return this.friendConnectionRepo.find({
      where: {
        receiver: user,
      },
    });
  }
}
