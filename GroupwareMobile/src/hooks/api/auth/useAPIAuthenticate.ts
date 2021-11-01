import {useMutation, UseMutationOptions} from 'react-query';
import {User} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {authenticateURL} from '../../../utils/url/auth.url';

const apiAuthenticate = async () => {
  const response = await axiosInstance.get<Partial<User>>(authenticateURL, {
    withCredentials: true,
  });
  return response.data;
};

export const useAPIAuthenticate = (
  mutationOptions?: UseMutationOptions<Partial<User>, Error, unknown, unknown>,
) => {
  return useMutation<Partial<User>, Error>(apiAuthenticate, mutationOptions);
};
