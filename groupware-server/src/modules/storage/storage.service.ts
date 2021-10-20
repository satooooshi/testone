import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  constructor(private readonly configService: ConfigService) {}
  private readonly storage = new Storage({
    keyFilename: __dirname + '../../../cloud_storage.json',
  });

  public async upload(files: Express.Multer.File[]) {
    const storage = new Storage({
      keyFilename: __dirname + '../../../cloud_storage.json',
    });
    const bucket = storage.bucket(
      this.configService.get('CLOUD_STORAGE_BUCKET'),
    );
    const urls: string[] = [];
    for await (const f of files) {
      const resolveAfterUpload = () => {
        return new Promise<void>((resolve) => {
          const blob = bucket.file(
            Date.now() + '/' + f.originalname.replace(/ /g, '_'),
          );
          const blobStream = blob.createWriteStream({
            resumable: false,
          });
          blobStream.on('error', (err) => console.log(err));
          blobStream.on('finish', () => {
            urls.push(
              `https://storage.googleapis.com/${bucket.name}/${blob.name}`,
            );
            resolve();
          });
          blobStream.end(f.buffer);
        });
      };
      await resolveAfterUpload();
    }
    return urls;
  }

  public async downloadFile(urls: string[]): Promise<any[]> {
    const bucketName = this.configService.get('CLOUD_STORAGE_BUCKET');
    const arr: any[] = [];
    for await (const url of urls) {
      const bucketURL = 'https://storage.googleapis.com/' + bucketName + '/';
      const storageObjURL = url.replace(bucketURL, '');
      const downloadedFile = await this.storage
        .bucket(bucketName)
        .file(storageObjURL)
        .get();
      arr.push(downloadedFile[0]);
    }
    return arr;
  }

  public async parseStorageURLToSignedURL(text: string): Promise<string> {
    let parseText = text;
    const bucketName = this.configService.get('CLOUD_STORAGE_BUCKET');
    const url = 'https://storage.googleapis.com/' + bucketName + '/';
    const regex = new RegExp(`${url}[^'")\\s]+`, 'g');
    const storageURLs = text.match(regex);
    if (!storageURLs || !storageURLs.length) {
      return text;
    }
    const options: any = {
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    };

    for await (const unsignedURL of storageURLs) {
      let fileName = unsignedURL.replace(url, '');
      const isQueryParamExists = fileName.includes('?');
      if (isQueryParamExists) {
        fileName = fileName.substr(0, fileName.indexOf('?'));
      }
      const signedURL = await this.storage
        .bucket(bucketName)
        .file(fileName)
        .getSignedUrl(options);
      const replaceRegWithSpace = new RegExp(`${unsignedURL}\\s`, 'g');
      const replaceRegWithEnd = new RegExp(`${unsignedURL}$`, 'g');
      parseText = parseText.replace(replaceRegWithSpace, signedURL[0] + ' ');
      parseText = parseText.replace(replaceRegWithEnd, signedURL[0]);
    }
    return parseText;
  }

  public parseSignedURLToStorageURL(text: string): string {
    let parseText = text;
    const bucketName = this.configService.get('CLOUD_STORAGE_BUCKET');
    const url = 'https://storage.googleapis.com/' + bucketName + '/';
    const regex = new RegExp(`${url}[^'")\\s]+`, 'g');
    const urls = text.match(regex);
    if (!urls || !urls.length) {
      return text;
    }
    for (const matchedSignedURL of urls) {
      let unsignedURL = matchedSignedURL;
      const isQueryParamExists = unsignedURL.includes('?');
      if (isQueryParamExists) {
        unsignedURL = unsignedURL.substr(0, unsignedURL.indexOf('?'));
      }
      if (matchedSignedURL.slice(-1) === '"') {
        unsignedURL += '"';
      }
      parseText = parseText.replace(matchedSignedURL, unsignedURL);
    }
    return parseText;
  }
}
