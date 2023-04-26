import {
  Controller,
  Get,
  UseGuards,
  Param,
  Post,
  Request,
  Put,
  Body,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/auth/models/user/user.interface';
import { UserService } from 'src/user/services/user.service';
import {
  FriendConnection,
  FriendConnectionStatus,
} from '../models/friend-connection.interfaces';
import { FriendConnectionService } from '../services/friend-connection.service';

@Controller('friend-connection')
export class FriendConnectionController {
  constructor(
    private userService: UserService,
    private friendConnection: FriendConnectionService,
  ) {}

  @UseGuards(JwtGuard)
  @Get(':userId')
  async findUserById(@Param('userId') userId: string): Promise<User> {
    return this.userService.getUserInfo(userId);
  }

  @UseGuards(JwtGuard)
  @Post('friend-request/send/:receiverId')
  async sendConnectionRequest(
    @Param('receiverId') receiverId: string,
    @Request() req: { user: User },
  ): Promise<FriendConnection> {
    return this.friendConnection.sendFriendRequest(receiverId, req.user);
  }

  @UseGuards(JwtGuard)
  @Get('friend-request/status/:receiverId')
  async getFriendRequestStatus(
    @Param('receiverId') receiverId: string,
    @Request() req: { user: User },
  ): Promise<FriendConnectionStatus> {
    return this.friendConnection.getFriendRequestStatus(receiverId, req.user);
  }

  @UseGuards(JwtGuard)
  @Put('friend-request/response/:friendRequestId')
  async respondFriendRequest(
    @Param('friendRequestId') friendRequestId: string,
    @Body() statusResponse: FriendConnectionStatus,
  ): Promise<FriendConnectionStatus> {
    return this.friendConnection.respondToFriendRequest(
      statusResponse.status,
      friendRequestId,
    );
  }

  @UseGuards(JwtGuard)
  @Put('friend-request/me/received-requests')
  async getFriendRequests(
    @Request() req: { user: User },
  ): Promise<FriendConnection[]> {
    return this.friendConnection.getFriendRequests(req.user);
  }
}
