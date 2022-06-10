import axios, { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { axiosInstance } from 'src/utils/url';
import { readStorageURL, uploadStorageURL } from 'src/utils/url/storage.url';
import Resizer from 'react-image-file-resizer';
import { isImage } from 'src/utils/indecateChatMessageType';

export const uploadStorage = async (files: File[]): Promise<string[]> => {
  // console.log('----', files);

  // for (let i = 0; i < files.length; i++) {
  //   if (isImage(files[i].name)) {
  //     new Promise((resolve) => {
  //       Resizer.imageFileResizer(
  //         files[i],
  //         1000,
  //         1000,
  //         'JPEG',
  //         50,
  //         0,
  //         (uri) => {
  //           resolve(uri);
  //         },
  //         'base64',
  //       );
  //     });
  //     console.log('----after-', files[i]);
  //   }
  // }
  // console.log('----after', files);
  const fileNames = files.map((f) => f.name);
  try {
    const res = await axiosInstance.post(uploadStorageURL, fileNames);
    const signedURLMapping: { [fileName: string]: string } = res.data;
    const fileURLs = await Promise.all(
      files.map(async (f) => {
        const formData = new FormData();
        formData.append('file', f);
        await axios.put(signedURLMapping[f.name], f);
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
