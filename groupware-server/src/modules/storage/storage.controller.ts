import {
  Body,
  Controller,
  Post,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { StorageService } from './storage.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files'))
  async upload(
    @UploadedFiles() files: Express.Multer.File[],
    @Res() res: Response,
  ) {
    return res.sendStatus(413);
    // return await this.storageService.upload(files);
  }

  @Post('get-signed-url-map')
  async getSignedUrlFromUnSignedUrl(@Body() body: { text: string[] }): Promise<
    {
      [unsignedURL: string]: string;
    }[]
  > {
    const { text } = body;
    const urlMaps = [];
    for await (const unsignedURL of text) {
      const signedURL = await this.storageService.parseStorageURLToSignedURL(
        unsignedURL,
      );
      urlMaps.push({ [unsignedURL]: signedURL });
    }
    return urlMaps;
  }
}
