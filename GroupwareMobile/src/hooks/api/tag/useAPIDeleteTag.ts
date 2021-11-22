import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {Tag} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {deleteTagURL} from '../../../utils/url/tag.url';

const deleteTag = async (tag: Tag) => {
  const res = await axiosInstance.post<Tag>(deleteTagURL, {id: tag.id});
  return res.data;
};

export const useAPIDeleteTag = (
  mutationOptions?: UseMutationOptions<Tag, AxiosError, Tag, unknown>,
) => {
  return useMutation<Tag, AxiosError, Tag>(deleteTag, mutationOptions);
};
