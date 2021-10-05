import { useMutation, UseMutationOptions } from 'react-query';
import { User } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { registerURL } from 'src/utils/url/auth.url';

export type RegisterDto = {
  email: string;
  lastName: string;
  firstName: string;
  password: string;
};

const register = async (data: Partial<User>) => {
  const res = await axiosInstance.post(registerURL, data);
  return res.data;
};

export const useAPIRegister = (
  mutationOptions?: UseMutationOptions<User, Error, Partial<User>, unknown>,
) => {
  return useMutation<User, Error, Partial<User>>(
    (dto) => register(dto),
    mutationOptions,
  );
};
