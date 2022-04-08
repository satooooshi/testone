import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {User} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {registerURL} from '../../../utils/url/auth.url';

export type RegisterDto = {
  email: string;
  lastName: string;
  firstName: string;
  password: string;
};

const register = async (data: Partial<User>) => {
  const res = await axiosInstance.post<User>(registerURL, data);
  return res.data;
};

export const useAPIRegister = (
  mutationOptions?: UseMutationOptions<
    User,
    AxiosError,
    Partial<User>,
    unknown
  >,
) => {
  return useMutation<User, AxiosError, Partial<User>>(
    dto => register(dto),
    mutationOptions,
  );
};
