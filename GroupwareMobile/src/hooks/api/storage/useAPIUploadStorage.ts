import {axiosInstance} from '../../../utils/url';
import {uploadStorageURL} from '../../../utils/url/storage.url';
import {UseMutationOptions, useMutation} from 'react-query';
import {Alert} from 'react-native';

export const uploadStorage = async (formData: FormData): Promise<string[]> => {
  try {
    const res = await axiosInstance.post<string[]>(uploadStorageURL, formData);
    return res.data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error('except error object');
  }
};

export const useAPIUploadStorage = (
  mutationOptions?: UseMutationOptions<string[], Error, FormData, unknown>,
) => {
  return useMutation<string[], Error, FormData>(uploadStorage, {
    ...mutationOptions,
    onError: (err, variables, context) => {
      Alert.alert(
        err.message.includes('413')
          ? 'ファイルの容量が大きい為、アップロード出来ませんでした。\n容量が大きくないファイルを使用して下さい。'
          : 'ファイルのアップロードに失敗しました',
      );
      mutationOptions?.onError &&
        mutationOptions.onError(err, variables, context);
    },
  });
};
