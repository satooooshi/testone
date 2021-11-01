import {useMutation, UseMutationOptions} from 'react-query';
import {User} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {updateProfileURL} from '../../../utils/url/user.url';

const updateUser = async (user: Partial<User>): Promise<User> => {
  const res = await axiosInstance.post<User>(updateProfileURL, user, {
    headers: jsonHeader,
  });
  return res.data;
};

export const useAPIUpdateUser = (
  mutationOptions?: UseMutationOptions<User, Error, Partial<User>, unknown>,
) => {
  return useMutation<User, Error, Partial<User>>(updateUser, mutationOptions);
};
