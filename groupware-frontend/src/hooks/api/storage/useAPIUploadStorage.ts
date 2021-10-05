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
  if (res.status === 413) {
    //@TODO if file size too large, this status return. must handle this error
  }
  return res.data;
};

export const useAPIUploadStorage = (
  mutationOptions?: UseMutationOptions<string[], Error, File[], unknown>,
) => {
  return useMutation<string[], Error, File[]>(uploadStorage, mutationOptions);
};
