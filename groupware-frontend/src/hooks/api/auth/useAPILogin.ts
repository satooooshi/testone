import { useMutation, UseMutationOptions } from 'react-query';
import { User } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { loginURL } from 'src/utils/url/auth.url';
import { jsonHeader } from 'src/utils/url/header';

export type LoginRequest = {
  email: string;
  password: string;
};

const login = async (values: LoginRequest): Promise<Partial<User>> => {
  const response = await axiosInstance.post(loginURL, values, {
    headers: jsonHeader,
    withCredentials: true,
  });
  return response.data;
};
export const useAPILogin = (
  mutationOptions?: UseMutationOptions<
    Partial<User>,
    Error,
    LoginRequest,
    unknown
  >,
) => {
  return useMutation<Partial<User>, Error, LoginRequest>(
    login,
    mutationOptions,
  );
};
