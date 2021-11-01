import {useMutation, UseMutationOptions} from 'react-query';
import {UserTag} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {deleteUserTagURL} from '../../../utils/url/tag.url';

const deleteTag = async (tag: UserTag) => {
  const res = await axiosInstance.post<UserTag>(deleteUserTagURL, {id: tag.id});
  return res.data;
};

export const useAPIDeleteUserTag = (
  mutationOptions?: UseMutationOptions<UserTag, Error, UserTag, unknown>,
) => {
  return useMutation<UserTag, Error, UserTag>(deleteTag, mutationOptions);
};
