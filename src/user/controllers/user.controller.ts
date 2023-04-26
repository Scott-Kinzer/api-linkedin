/* eslint-disable @typescript-eslint/no-var-requires */
import { JwtGuard } from 'src/auth/guards/jwt.guard';
import { UserService } from '../services/user.service';
import {
  UseGuards,
  Get,
  Request,
  Controller,
  NotFoundException,
  Post,
  UseInterceptors,
  UploadedFile,
  Param,
} from '@nestjs/common';
import { User } from 'src/auth/models/user/user.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as uuid from 'uuid';
import { UpdateResult } from 'typeorm';
const B2 = require('backblaze-b2');

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtGuard)
  @Get()
  async create(@Request() req: { user: User }): Promise<User> {
    const userInfo = await this.userService.getUserInfo(req.user.id);

    if (!userInfo) {
      throw new NotFoundException('User not found');
    }

    return userInfo;
  }

  @UseGuards(JwtGuard)
  @Get(':id')
  async getUserInfo(@Param('id') id: string): Promise<User> {
    const userInfo = await this.userService.getUserInfo(id);

    if (!userInfo) {
      throw new NotFoundException('User not found');
    }

    return userInfo;
  }

  @UseGuards(JwtGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {}))
  async postImage(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: { user: User },
  ): Promise<UpdateResult> {
    const b2Client = new B2({
      applicationKeyId: process.env.BLACKBAZE_KEY_ID,
      applicationKey: process.env.BLACKBAZE_KEY,
    });

    const bucketName = 'images-linkedin-clone';

    const ext = path.extname(file.originalname);

    if (!['.jpeg', '.jpg', '.png'].includes(ext)) {
      throw new NotFoundException(
        'Please upload file with png, jpeg, jpg extenstions',
      );
    }

    // Check the file size
    const fileSizeInBytes = file.size;
    const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
    if (fileSizeInMegabytes > 3) {
      throw new NotFoundException(
        'File size exceeds the maximum allowed limit of 3 MB',
      );
    }

    const filename = `${uuid.v4()}${ext}`;

    await b2Client.authorize();
    const bucketResponse = await b2Client.getBucket({
      bucketName: bucketName,
    });

    const uploadUrlResponse = await b2Client.getUploadUrl({
      bucketId: bucketResponse.data.buckets[0].bucketId,
    });

    const fileData = file.buffer;

    const currentFile = await this.userService.findImageIdByUserId(req.user.id);

    if (currentFile) {
      await b2Client.deleteFileVersion({
        fileId: currentFile.fileId,
        fileName: currentFile.fileName,
      });
    }

    const data = await b2Client.uploadFile({
      uploadUrl: uploadUrlResponse.data.uploadUrl,
      uploadAuthToken: uploadUrlResponse.data.authorizationToken,
      fileName: filename,
      data: fileData,
      info: {
        'Content-Type': file.mimetype,
      },
    });

    const updatedImage = await this.userService.updateUserImageById(
      req.user.id,
      `https://f005.backblazeb2.com/file/${bucketName}/${filename}`,
      data.data.fileId,
      data.data.fileName,
    );

    if (!updatedImage) {
      throw new NotFoundException('Cannot update image');
    }

    return updatedImage;
  }
}
