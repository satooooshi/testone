import {
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import JwtAuthenticationGuard from '../auth/jwtAuthentication.guard';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('read')
  @UseGuards(JwtAuthenticationGuard)
  // @UseInterceptors(FilesInterceptor('files'))
  async read(
    @Body()
    fileNames: string[] /* @UploadedFiles() files: Express.Multer.File[] */,
  ) {
    const fileURLs = await this.storageService.genSignedURLForRead(
      fileNames /* files */,
    );
    // const signedURLs: string[] = [];
    // for (const u of fileURLs) {
    //   const parsedURL = await this.storageService.parseStorageURLToSignedURL(u);
    //   signedURLs.push(parsedURL);
    // }
    return fileURLs;
  }

  @Post('upload')
  @UseGuards(JwtAuthenticationGuard)
  // @UseInterceptors(FilesInterceptor('files'))
  async upload(
    @Body()
    fileNames: string[] /* @UploadedFiles() files: Express.Multer.File[] */,
  ) {
    const fileURLs = await this.storageService.genSignedURLForUpload(
      fileNames /* files */,
    );
    // const signedURLs: string[] = [];
    // for (const u of fileURLs) {
    //   const parsedURL = await this.storageService.parseStorageURLToSignedURL(u);
    //   signedURLs.push(parsedURL);
    // }
    return fileURLs;
  }
}
