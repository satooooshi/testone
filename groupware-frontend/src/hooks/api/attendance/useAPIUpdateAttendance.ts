import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { Attendance } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { attendanceURL } from 'src/utils/url/attendance.url';

const updateAttendance = async (query: Attendance) => {
  const res = await axiosInstance.patch<Attendance>(attendanceURL, query);
  return res.data;
};

export const useAPIUpdateAttendance = (
  options?: UseMutationOptions<Attendance, AxiosError, Attendance, unknown>,
) => {
  return useMutation<Attendance, AxiosError, Attendance, unknown>(
    updateAttendance,
    options,
  );
};
