import { Injectable } from '@nestjs/common';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

import { FeedPostEntity } from '../models/post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { FeedPost, FeedPostPayload } from '../models/post.interface';
import { Observable, from } from 'rxjs';
import { User } from 'src/auth/models/user/user.interface';

@Injectable()
export class FeedService {
  constructor(
    @InjectRepository(FeedPostEntity)
    private readonly feedPostRepository: Repository<FeedPostEntity>,
  ) {}

  async createPost(user: User, feedPost: FeedPostPayload): Promise<FeedPost> {
    const createdPost = await this.feedPostRepository.save({
      ...feedPost,
      author: user,
    });

    delete createdPost.author.password;
    delete createdPost.author.role;

    return createdPost;
  }

  findAllPosts(): Observable<FeedPost[]> {
    return from(this.feedPostRepository.find());
  }

  findPosts(take: number, skip: number): Observable<FeedPost[]> {
    return from(
      this.feedPostRepository
        .createQueryBuilder('post')
        .leftJoinAndSelect('post.author', 'author')
        .select([
          'post',
          'author.firstName',
          'author.lastName',
          'author.imagePath',
          'author.id',
        ])
        .orderBy('post.createdAt', 'DESC')
        .take(take)
        .skip(skip)
        .getMany(),
    );
  }

  async updatePost(
    id: string,
    feedPost: FeedPost,
    user: User,
  ): Promise<UpdateResult> {
    const findPost = await this.feedPostRepository.findOneBy({ id });

    if (findPost.author.id !== user.id) {
      return null;
    }

    return this.feedPostRepository.update(id, feedPost);
  }

  async deletePost(id: string, user: User): Promise<DeleteResult> {
    const findPost = await this.feedPostRepository.findOneBy({ id });

    if (findPost.author.id !== user.id) {
      return null;
    }

    return this.feedPostRepository.delete(id);
  }
}
