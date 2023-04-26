import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/auth/models/user/user.entity';
import { User } from 'src/auth/models/user/user.interface';
import { Repository, UpdateResult } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async getUserInfo(userId: string): Promise<User> {
    const userInfo = await this.userRepo.findOneBy({ id: userId });

    if (!userInfo) {
      return null;
    }

    delete userInfo.password;

    return userInfo;
  }

  async updateUserImageById(
    id: string,
    imagePath: string,
    fileId: string,
    fileName: string,
  ): Promise<UpdateResult> {
    const user = await this.userRepo.findOneBy({ id });

    if (!user) return null;

    user.imagePath = imagePath;
    user.fileId = fileId;
    user.fileName = fileName;

    return this.userRepo.update(user.id, user);
  }

  async findImageIdByUserId(id: string) {
    const user = await this.userRepo.findOneBy({ id });

    if (!user.imagePath || !user.fileName) return null;

    return { fileId: user.fileId, fileName: user.fileName };
  }
}
