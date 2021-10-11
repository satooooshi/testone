import { useMutation, UseMutationOptions } from 'react-query';
import { UserTag } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { deleteUserTagURL } from 'src/utils/url/tag.url';

const deleteTag = async (tag: UserTag) => {
  const res = await axiosInstance.delete(
    deleteUserTagURL + '/' + tag.id.toString(),
  );
  return res.data;
};

export const useAPIDeleteUserTag = (
  mutationOptions?: UseMutationOptions<UserTag, Error, UserTag, unknown>,
) => {
  return useMutation<UserTag, Error, UserTag>(deleteTag, mutationOptions);
};
