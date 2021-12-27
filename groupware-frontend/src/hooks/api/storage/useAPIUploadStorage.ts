import axios, { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { axiosInstance } from 'src/utils/url';
import { uploadStorageURL } from 'src/utils/url/storage.url';

export const uploadStorage = async (files: File[]): Promise<string[]> => {
  const fileNames = files.map((f) => f.name);
  try {
    const res = await axiosInstance.post(uploadStorageURL, fileNames);
    const signedURLMapping: { [fileName: string]: string } = res.data;
    const fileURLs = Promise.all(
      files.map(async (f) => {
        const formData = new FormData();
        formData.append('file', f);
        await axios.put(signedURLMapping[f.name], f);
        return signedURLMapping[f.name];
      }),
    );
    return fileURLs;
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
