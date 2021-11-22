import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { Tag } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { createTagURL } from 'src/utils/url/tag.url';

const createTag = async (tag: Partial<Tag>) => {
  const res = await axiosInstance.post(createTagURL, tag);
  return res.data;
};

export const useAPICreateTag = (
  mutationOptions?: UseMutationOptions<Tag, AxiosError, Partial<Tag>, unknown>,
) => {
  return useMutation<Tag, AxiosError, Partial<Tag>>(createTag, mutationOptions);
};
