import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {Attendance} from 'src/types';
import {axiosInstance} from '../../../utils/url';
import {attendanceURL} from '../../../utils/url/attendance.url';

const createAttendance = async (query: Partial<Attendance>) => {
  const res = await axiosInstance.post<Attendance>(attendanceURL, query);
  return res.data;
};

export const useAPICreateAttendance = (
  options?: UseMutationOptions<
    Attendance,
    AxiosError,
    Partial<Attendance>,
    unknown
  >,
) => {
  return useMutation<Attendance, AxiosError, Partial<Attendance>, unknown>(
    createAttendance,
    options,
  );
};
