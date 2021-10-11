import { useMutation, UseMutationOptions } from 'react-query';
import { Tag } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { createUserTagURL } from 'src/utils/url/tag.url';

const createTag = async (tag: Partial<Tag>) => {
  const res = await axiosInstance.post(createUserTagURL, tag);
  return res.data;
};

export const useAPICreateUserTag = (
  mutationOptions?: UseMutationOptions<Tag, Error, Partial<Tag>, unknown>,
) => {
  return useMutation<Tag, Error, Partial<Tag>>(createTag, mutationOptions);
};
