import { useMutation, UseMutationOptions } from 'react-query';
import { User } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { updateProfileURL } from 'src/utils/url/user.url';
import { jsonHeader } from 'src/utils/url/header';

const updateUser = async (user: Partial<User>): Promise<User> => {
  const res = await axiosInstance.post(updateProfileURL, user, {
    headers: jsonHeader,
  });
  return res.data;
};

export const useAPIUpdateUser = (
  mutationOptions?: UseMutationOptions<User, Error, Partial<User>, unknown>,
) => {
  return useMutation<User, Error, Partial<User>>(updateUser, mutationOptions);
};
