import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {axiosInstance} from '../../../utils/url';
import {registerDeviceURL} from '../../../utils/url/notification.url';

const deleteDevice = async (token: string) => {
  const res = await axiosInstance.delete<void>(registerDeviceURL + `/${token}`);
  return res.data;
};

export const useAPIDeleteDevice = (
  useMutationOptions?: UseMutationOptions<void, AxiosError, string, unknown>,
) => {
  return useMutation<void, AxiosError, string, unknown>(
    deleteDevice,
    useMutationOptions,
  );
};
