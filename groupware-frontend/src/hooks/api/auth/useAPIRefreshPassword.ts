import { useMutation, UseMutationOptions } from 'react-query';
import { axiosInstance } from 'src/utils/url';
import { refreshedPasswordURL } from 'src/utils/url/auth.url';

export type RefreshPasswordDto = {
  email: string;
};

const refreshPassword = async (dto: RefreshPasswordDto) => {
  const res = await axiosInstance.post(refreshedPasswordURL, dto);
  return res.data;
};

export const useAPIRefreshPassword = (
  mutationOptions?: UseMutationOptions<void, Error, RefreshPasswordDto>,
) => {
  return useMutation<void, Error, RefreshPasswordDto>(
    refreshPassword,
    mutationOptions,
  );
};
