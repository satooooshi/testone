import {axiosInstance} from '../../../utils/url';
import {readStorageURL, uploadStorageURL} from '../../../utils/url/storage.url';
import {UseMutationOptions, useMutation} from 'react-query';
import {Alert} from 'react-native';
import axios, {AxiosError} from 'axios';
import RNFetchBlob from 'rn-fetch-blob';
import {Buffer} from 'buffer';
const {fs} = RNFetchBlob;

export const uploadStorage = async (formData: FormData): Promise<string[]> => {
  try {
    //@ts-ignore
    const parts: any[] = await formData?.getParts(
      (item: any) => item.fieldName === 'files',
    );
    const fileNames = parts.map(p => p.name);
    const res = await axiosInstance.post<{[fileName: string]: string}>(
      uploadStorageURL,
      fileNames,
    );
    const signedURLMapping = res.data;
    const fileURLs = await Promise.all(
      parts.map(async p => {
        const formDataToUpload = new FormData();
        formDataToUpload.append('files', p);
        const file = await fs.readFile(p.uri, 'base64');
        const myBuffer = Buffer.from(file, 'base64');

        await axios.put(signedURLMapping[p.name], myBuffer);
        // console.log(res?.data);
        return signedURLMapping[p.name];
      }),
    );
    const urlResponse = await axiosInstance.post<string[]>(
      readStorageURL,
      fileURLs,
    );
    return urlResponse.data;

    // return res.data;
  } catch (err) {
    if (err instanceof Error) {
      throw new Error(err.message);
    }
    throw new Error('except error object');
  }
};

export const useAPIUploadStorage = (
  mutationOptions?: UseMutationOptions<string[], AxiosError, FormData, unknown>,
) => {
  return useMutation<string[], AxiosError, FormData>(uploadStorage, {
    ...mutationOptions,
    onError: (err, variables, context) => {
      console.log(err);
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
