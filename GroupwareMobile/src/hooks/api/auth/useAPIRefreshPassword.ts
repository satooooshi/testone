import {useMutation, UseMutationOptions} from 'react-query';
import {axiosInstance} from '../../../utils/url';
import {refreshedPasswordURL} from '../../../utils/url/auth.url';

export type RefreshPasswordDto = {
  email: string;
};

const refreshPassword = async (dto: RefreshPasswordDto) => {
  const res = await axiosInstance.post<void>(refreshedPasswordURL, dto);
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
