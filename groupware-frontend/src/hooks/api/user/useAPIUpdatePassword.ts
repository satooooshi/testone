import { useMutation, UseMutationOptions } from 'react-query';
import { axiosInstance } from 'src/utils/url';
import { updatePasswordURL } from 'src/utils/url/user.url';
import { jsonHeader } from 'src/utils/url/header';

type UpdatePasswordDto = {
  currentPassword: string;
  newPassword: string;
};

const updatePassword = async (user: UpdatePasswordDto) => {
  const res = await axiosInstance.post(updatePasswordURL, user, {
    headers: jsonHeader,
  });
  return res.data;
};

export const useAPIUpdatePassword = (
  mutationOptions?: UseMutationOptions<void, Error, UpdatePasswordDto, unknown>,
) => {
  return useMutation<void, Error, UpdatePasswordDto>(
    updatePassword,
    mutationOptions,
  );
};
