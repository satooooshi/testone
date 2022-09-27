import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { AttendanceRepo } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { attendanceReportURL } from 'src/utils/url/attendance.url';

const updateAttendanceReport = async (query: Partial<AttendanceRepo>) => {
  const res = await axiosInstance.patch<AttendanceRepo>(
    attendanceReportURL,
    query,
  );
  return res.data;
};

export const useAPIUpdateAttendanceReport = (
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
  >(updateAttendanceReport, options);
};
