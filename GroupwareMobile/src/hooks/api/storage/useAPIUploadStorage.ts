import {axiosInstance} from '../../../utils/url';
import {uploadStorageURL} from '../../../utils/url/storage.url';
import {UseMutationOptions, useMutation} from 'react-query';

export const uploadStorage = async (formData: FormData): Promise<string[]> => {
  const res = await axiosInstance.post<string[]>(uploadStorageURL, formData);
  console.log(res.status);
  if (res.status === 413) {
    //@TODO if file size too large, this status return. must handle this error
  }
  return res.data;
};

export const useAPIUploadStorage = (
  mutationOptions?: UseMutationOptions<string[], Error, FormData, unknown>,
) => {
  return useMutation<string[], Error, FormData>(uploadStorage, mutationOptions);
};
