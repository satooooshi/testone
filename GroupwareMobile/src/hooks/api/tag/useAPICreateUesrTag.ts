import {useMutation, UseMutationOptions} from 'react-query';
import {Tag} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {createUserTagURL} from '../../../utils/url/tag.url';

const createTag = async (tag: Partial<Tag>) => {
  const res = await axiosInstance.post<Tag>(createUserTagURL, tag);
  return res.data;
};

export const useAPICreateUserTag = (
  mutationOptions?: UseMutationOptions<Tag, Error, Partial<Tag>, unknown>,
) => {
  return useMutation<Tag, Error, Partial<Tag>>(createTag, mutationOptions);
};
