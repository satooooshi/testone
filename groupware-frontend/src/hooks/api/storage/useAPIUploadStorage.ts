import axios, { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { axiosInstance } from 'src/utils/url';
import { readStorageURL, uploadStorageURL } from 'src/utils/url/storage.url';
import { isImage } from 'src/utils/indecateChatMessageType';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
import Compress from 'compress.js';
// import heic2any from 'heic2any';

export const uploadStorage = async (files: File[]): Promise<string[]> => {
  const compress = new Compress();
  const resizeImage = async (file: File): Promise<Blob> => {
    if (isImage(file.name)) {
      const isHeic = !!file.name.toUpperCase().match(/\.(heif|heic)/i);
      const heicToBlob = async (file: File) => {
        // this was only way to resolve err about heic2any at this time
        // eslint-disable-next-line
        const heic2any = require('heic2any');
        return await heic2any({
          blob: file,
          toType: 'image/jpeg',
          quality: 1,
        });
      };

      const resizedImage = await compress.compress(
        [isHeic ? await heicToBlob(file) : file],
        {
          size: 1, // the max size in MB, defaults to 2MB
          quality: 1, // the quality of the image, max is 1,
          maxWidth: 800, // the max width of the output image, defaults to 1920px
          maxHeight: 800, // the max height of the output image, defaults to 1920px
          resize: true, // defaults to true, set false if you do not want to resize the image width and height
        },
      );
      const img = resizedImage[0];
      const base64str = img.data;
      const imgExt = img.ext;
      const resizedFiile = Compress.convertBase64ToFile(base64str, imgExt);
      return file.size < resizedFiile.size ? file : resizedFiile;
    }
    return file;
  };

  const fileNames = files.map((f) => f.name);
  try {
    const res = await axiosInstance.post(uploadStorageURL, fileNames);
    const data: {
      fname: string;
      signedURL: string;
    } = res.data;
    const signedURLMapping: typeof data[] = [];
    for (const [name, url] of Object.entries(data)) {
      const obj: typeof data = {
        fname: name,
        signedURL: url,
      };
      signedURLMapping.push(obj);
    }

    const fileURLs = await Promise.all(
      files.map(async (f, i) => {
        const formData = new FormData();
        const resizeImageBlob = await resizeImage(f);
        const fileChangedToBlob = new File([resizeImageBlob], `${f.name}`);
        formData.append('file', fileChangedToBlob);
        await axios.put(signedURLMapping[i].signedURL, fileChangedToBlob);
        return signedURLMapping[i].signedURL;
      }),
    );
    const urlResponse = await axiosInstance.post<string[]>(
      readStorageURL,
      fileURLs,
    );
    return urlResponse.data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error('except error object');
  }
};

export const useAPIUploadStorage = (
  mutationOptions?: UseMutationOptions<string[], AxiosError, File[], unknown>,
) => {
  return useMutation<string[], AxiosError, File[]>(uploadStorage, {
    ...mutationOptions,
    onError: (err, variables, context) => {
      alert(
        err.message.includes('413')
          ? 'ファイルの容量が大きい為、アップロード出来ませんでした。\n容量が大きくないファイルを使用して下さい。'
          : 'ファイルのアップロードに失敗しました',
      );
      mutationOptions?.onError &&
        mutationOptions.onError(err, variables, context);
    },
  });
};
