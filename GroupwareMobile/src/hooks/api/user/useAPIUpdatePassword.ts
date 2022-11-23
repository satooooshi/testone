import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {axiosInstance} from '../../../utils/url';
import {updatePasswordURL} from '../../../utils/url/user.url';

type UpdatePasswordDto = {
  currentPassword: string;
  newPassword: string;
};

const updatePassword = async (user: UpdatePasswordDto) => {
  const res = await axiosInstance.post<void>(updatePasswordURL, user);
  return res.data;
};

export const useAPIUpdatePassword = (
  mutationOptions?: UseMutationOptions<
    void,
    AxiosError,
    UpdatePasswordDto,
    unknown
  >,
) => {
  return useMutation<void, AxiosError, UpdatePasswordDto>(
    updatePassword,
    mutationOptions,
  );
};
