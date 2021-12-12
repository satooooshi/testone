import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {NotificationDevice} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {registerDeviceURL} from '../../../utils/url/notification.url';

const registerDevice = async (device: Partial<NotificationDevice>) => {
  const res = await axiosInstance.post<NotificationDevice>(
    registerDeviceURL,
    device,
  );
  return res.data;
};

export const useAPIRegisterDevice = (
  useMutationOptions?: UseMutationOptions<
    NotificationDevice,
    AxiosError,
    Partial<NotificationDevice>,
    unknown
  >,
) => {
  return useMutation<
    NotificationDevice,
    AxiosError,
    Partial<NotificationDevice>,
    unknown
  >(registerDevice, useMutationOptions);
};
