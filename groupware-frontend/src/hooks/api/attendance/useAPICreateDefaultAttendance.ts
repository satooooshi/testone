import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { DefaultAttendance } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { defaultAttendanceURL } from 'src/utils/url/attendance.url';

const createDefaultAttendance = async (
  attendance: Partial<DefaultAttendance>,
) => {
  const res = await axiosInstance.post(defaultAttendanceURL, attendance);
  return res.data;
};

export const useAPICreateDefaultAttendance = (
  options?: UseMutationOptions<
    DefaultAttendance,
    AxiosError,
    Partial<DefaultAttendance>,
    unknown
  >,
) => {
  return useMutation<
    DefaultAttendance,
    AxiosError,
    Partial<DefaultAttendance>,
    unknown
  >(createDefaultAttendance, options);
};
