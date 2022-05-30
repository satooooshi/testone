import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {User} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {authenticateURL} from '../../../utils/url/auth.url';

export const apiAuthenticate = async () => {
  const response = await axiosInstance.get<Partial<User>>(authenticateURL, {
    withCredentials: true,
  });
  return response.data;
};

export const useAPIAuthenticate = (
  mutationOptions?: UseMutationOptions<
    Partial<User>,
    AxiosError,
    unknown,
    unknown
  >,
) => {
  return useMutation<Partial<User>, AxiosError>(
    apiAuthenticate,
    mutationOptions,
  );
};
