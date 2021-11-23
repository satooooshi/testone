import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { UserTag } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { deleteUserTagURL } from 'src/utils/url/tag.url';

const deleteTag = async (tag: UserTag) => {
  const res = await axiosInstance.post(deleteUserTagURL, { id: tag.id });
  return res.data;
};

export const useAPIDeleteUserTag = (
  mutationOptions?: UseMutationOptions<UserTag, AxiosError, UserTag, unknown>,
) => {
  return useMutation<UserTag, AxiosError, UserTag>(deleteTag, mutationOptions);
};
