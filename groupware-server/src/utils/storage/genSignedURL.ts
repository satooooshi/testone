import { Storage } from '@google-cloud/storage';
import { genStorageURL } from './genStorageURL';

export const genSignedURL = async (text: string): Promise<string> => {
  if (!text) {
    return text;
  }
  text = genStorageURL(text);
  const storage = new Storage({
    keyFilename: __dirname + '../../../cloud_storage.json',
  });
  let parseText = text;
  const bucketName = process.env.CLOUD_STORAGE_BUCKET;
  const url = 'https://storage.googleapis.com/' + bucketName + '/';
  const regex = new RegExp(`${url}[^'")\\s]+`, 'g');
  const storageURLs = text.match(regex);

  if (!storageURLs || !storageURLs.length) {
    return text;
  }
  const options: any = {
    version: 'v4',
    action: 'read',
    //1 hour
    expires: Date.now() + 30 * 60 * 1000,
  };

  for await (const unsignedURL of storageURLs) {
    let fileName = unsignedURL.replace(url, '');
    fileName = fileName.split('?')[0];
    const urlDecodedFileName = decodeURI(fileName);

    const isQueryParamExists = fileName.includes('?');
    if (isQueryParamExists) {
      fileName = fileName.substr(0, fileName.indexOf('?'));
    }
    const signedURL = await storage
      .bucket(bucketName)
      .file(urlDecodedFileName)
      .getSignedUrl(options);
    const unsignedURLForRegex = unsignedURL
      .replace('(', '\\(')
      .replace(')', '\\)');
    const replaceRegWithSpace = new RegExp(`${unsignedURLForRegex}\\s`, 'g');
    const replaceRegWithQuote = new RegExp(`${unsignedURLForRegex}"`, 'g');
    const replaceRegWithBracketEnd = new RegExp(
      `${unsignedURLForRegex}\\)`,
      'g',
    );
    const replaceRegWithEnd = new RegExp(`${unsignedURLForRegex}\$`, 'g');
    parseText = parseText.replace(replaceRegWithSpace, signedURL[0] + ' ');
    parseText = parseText.replace(replaceRegWithQuote, signedURL[0] + '"');
    parseText = parseText.replace(replaceRegWithBracketEnd, signedURL[0] + ')');
    parseText = parseText.replace(replaceRegWithEnd, signedURL[0]);
  }
  return parseText;
};
