import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { FeedService } from '../services/feed.service';
import { FeedPost, FeedPostPayload } from '../models/post.interface';
import { Observable, from } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { User } from 'src/auth/models/user/user.interface';

@Controller('feed')
export class FeedController {
  constructor(private feedService: FeedService) {}

  @UseGuards(JwtGuard)
  @Post()
  create(
    @Body() post: FeedPostPayload,
    @Request() req: { user: User },
  ): Promise<FeedPost> {
    return this.feedService.createPost(req.user, post);
  }

  @UseGuards(JwtGuard)
  @Get()
  findSelected(
    @Query('take') take = 1,
    @Query('skip') skip = 1,
  ): Observable<FeedPost[]> {
    take = take > 20 ? 20 : take;
    return from(this.feedService.findPosts(take, skip));
  }

  @UseGuards(JwtGuard)
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() post: FeedPost,
    @Request() req: { user: User },
  ): Promise<UpdateResult> {
    const updatedPost = await this.feedService.updatePost(id, post, req.user);

    if (!updatedPost) {
      throw new NotFoundException("Don't have access to this post");
    }

    return updatedPost;
  }

  @UseGuards(JwtGuard)
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Request() req: { user: User },
  ): Promise<DeleteResult> {
    const deletedPost = await this.feedService.deletePost(id, req.user);

    if (!deletedPost) {
      throw new NotFoundException("Don't have access to this post");
    }
    return deletedPost;
  }
}
