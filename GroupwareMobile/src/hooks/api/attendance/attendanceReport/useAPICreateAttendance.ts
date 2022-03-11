import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {AttendanceReport} from '../../../../types';
import {axiosInstance} from '../../../../utils/url';
import {attendanceReportURL} from '../../../../utils/url/attendance.url';

const createAttendance = async (query: Partial<AttendanceReport>) => {
  const res = await axiosInstance.post<AttendanceReport>(
    attendanceReportURL,
    query,
  );
  return res.data;
};

export const useAPICreateAttendance = (
  options?: UseMutationOptions<
    AttendanceReport,
    AxiosError,
    Partial<AttendanceReport>,
    unknown
  >,
) => {
  return useMutation<
    AttendanceReport,
    AxiosError,
    Partial<AttendanceReport>,
    unknown
  >(createAttendance, options);
};
