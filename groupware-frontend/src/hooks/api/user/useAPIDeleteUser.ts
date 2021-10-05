import { useMutation, UseMutationOptions } from 'react-query';
import { User } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { deleteUserURL } from 'src/utils/url/user.url';
import { jsonHeader } from 'src/utils/url/header';

const deleteUser = async (user: User): Promise<User> => {
  const res = await axiosInstance.post(deleteUserURL, user, {
    headers: jsonHeader,
  });
  return res.data;
};

export const useAPIDeleteUser = (
  mutationOptions?: UseMutationOptions<User, Error, User, unknown>,
) => {
  return useMutation<User, Error, User>(deleteUser, mutationOptions);
};
