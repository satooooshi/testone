import { useMutation, UseMutationOptions } from 'react-query';
import { User } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { authenticateURL } from 'src/utils/url/auth.url';

const apiAuthenticate = async (): Promise<Partial<User>> => {
  const response = await axiosInstance.get(authenticateURL, {
    withCredentials: true,
  });
  return response.data;
};

export const useAPIAuthenticate = (
  mutationOptions?: UseMutationOptions<Partial<User>, Error, unknown, unknown>,
) => {
  return useMutation<Partial<User>, Error>(apiAuthenticate, mutationOptions);
};
