import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {DefaultAttendance} from 'src/types';
import {axiosInstance} from '../../../utils/url';
import {defaultAttendanceURL} from '../../../utils/url/attendance.url';

const createDefaultAttendance = async (attendance: DefaultAttendance) => {
  const res = await axiosInstance.patch(defaultAttendanceURL, attendance);
  return res.data;
};

export const useAPIUpdateDefaultAttendance = (
  options?: UseMutationOptions<
    DefaultAttendance,
    AxiosError,
    DefaultAttendance,
    unknown
  >,
) => {
  return useMutation<DefaultAttendance, AxiosError, DefaultAttendance, unknown>(
    createDefaultAttendance,
    options,
  );
};
