import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { AttendanceRepo } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { attendanceReportURL } from 'src/utils/url/attendance.url';

const createAttendanceReport = async (query: Partial<AttendanceRepo>) => {
  const res = await axiosInstance.post<AttendanceRepo>(
    attendanceReportURL,
    query,
  );
  return res.data;
};

export const useAPICreateAttendanceReport = (
  options?: UseMutationOptions<
    AttendanceRepo,
    AxiosError,
    Partial<AttendanceRepo>,
    unknown
  >,
) => {
  return useMutation<
    AttendanceRepo,
    AxiosError,
    Partial<AttendanceRepo>,
    unknown
  >(createAttendanceReport, options);
};
