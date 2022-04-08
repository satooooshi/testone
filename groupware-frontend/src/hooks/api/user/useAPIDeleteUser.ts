import { useMutation, UseMutationOptions } from 'react-query';
import { User } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { deleteUserURL } from 'src/utils/url/user.url';
import { jsonHeader } from 'src/utils/url/header';
import { AxiosError } from 'axios';

const deleteUser = async (user: User): Promise<User> => {
  const res = await axiosInstance.post(deleteUserURL, user, {
    headers: jsonHeader,
  });
  return res.data;
};

export const useAPIDeleteUser = (
  mutationOptions?: UseMutationOptions<User, AxiosError, User, unknown>,
) => {
  return useMutation<User, AxiosError, User>(deleteUser, mutationOptions);
};
