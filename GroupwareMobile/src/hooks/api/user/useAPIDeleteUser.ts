import {useMutation, UseMutationOptions} from 'react-query';
import {User} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {deleteUserURL} from '../../../utils/url/user.url';

const deleteUser = async (user: User): Promise<User> => {
  const res = await axiosInstance.post<User>(deleteUserURL, user, {
    headers: jsonHeader,
  });
  return res.data;
};

export const useAPIDeleteUser = (
  mutationOptions?: UseMutationOptions<User, Error, User, unknown>,
) => {
  return useMutation<User, Error, User>(deleteUser, mutationOptions);
};
