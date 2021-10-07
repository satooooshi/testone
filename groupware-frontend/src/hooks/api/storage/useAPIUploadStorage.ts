import { useMutation, UseMutationOptions } from 'react-query';
import { axiosInstance } from 'src/utils/url';
import { uploadStorageURL } from 'src/utils/url/storage.url';

export const uploadStorage = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  const res = await axiosInstance.post(uploadStorageURL, formData);
  console.log(res.status);

  return res.status === 413 ? ['413'] : res.data;
};

export const useAPIUploadStorage = (
  mutationOptions?: UseMutationOptions<string[], Error, File[], unknown>,
) => {
  return useMutation<string[], Error, File[]>(uploadStorage, {
    ...mutationOptions,
    onError: (err, variables, context) => {
      alert(
        err.message.includes('413')
          ? '画像ファイルの容量が大きい為、アップロード出来ませんでした。\n容量が大きくない画像を使用して下さい。'
          : '画像のアップロードに失敗しました。',
      );
      mutationOptions?.onError &&
        mutationOptions.onError(err, variables, context);
    },
  });
};
