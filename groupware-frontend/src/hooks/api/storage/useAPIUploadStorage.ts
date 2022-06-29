import axios, { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { axiosInstance } from 'src/utils/url';
import { readStorageURL, uploadStorageURL } from 'src/utils/url/storage.url';
import { isImage } from 'src/utils/indecateChatMessageType';
import Compress from 'node_modules/compress.js/src';

export const uploadStorage = async (files: File[]): Promise<string[]> => {
  const compress = new Compress();
  const resizeImage = async (file: File): Promise<Blob> => {
    if (isImage(file.name)) {
      const resizedImage = await compress.compress([file], {
        size: 2, // the max size in MB, defaults to 2MB
        quality: 1, // the quality of the image, max is 1,
        maxWidth: 400, // the max width of the output image, defaults to 1920px
        maxHeight: 400, // the max height of the output image, defaults to 1920px
        resize: true, // defaults to true, set false if you do not want to resize the image width and height
      });
      const img = resizedImage[0];
      const base64str = img.data;
      const imgExt = img.ext;
      const resizedFiile = Compress.convertBase64ToFile(base64str, imgExt);
      return resizedFiile;
    }
    return file;
  };

  const fileNames = files.map((f) => f.name);
  try {
    const res = await axiosInstance.post(uploadStorageURL, fileNames);
    const signedURLMapping: { [fileName: string]: string } = res.data;
    const fileURLs = await Promise.all(
      files.map(async (f) => {
        const formData = new FormData();
        const resizeImageBlob = await resizeImage(f);
        const fileChangedToBlob = new File([resizeImageBlob], `${f.name}`);
        formData.append('file', fileChangedToBlob);
        await axios.put(signedURLMapping[f.name], fileChangedToBlob);
        return signedURLMapping[f.name];
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
