import {useMutation, UseMutationOptions} from 'react-query';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {User} from '../../../types';
import {loginURL} from '../../../utils/url/auth.url';
import {AxiosError} from 'axios';

export type LoginRequest = {
  email: string;
  password: string;
};

const login = async (values: LoginRequest) => {
  const response = await axiosInstance.post<Partial<User>>(loginURL, values, {
    headers: jsonHeader,
    withCredentials: true,
  });
  return response.data;
};
export const useAPILogin = (
  mutationOptions?: UseMutationOptions<
    Partial<User>,
    AxiosError,
    LoginRequest,
    unknown
  >,
) => {
  return useMutation<Partial<User>, AxiosError, LoginRequest>(
    login,
    mutationOptions,
  );
};
