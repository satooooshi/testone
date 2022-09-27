import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { AttendanceRepo } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { verifyAttendanceReportURL } from 'src/utils/url/attendance.url';

const verifyAttendanceReport = async (query: AttendanceRepo) => {
  const res = await axiosInstance.patch<AttendanceRepo>(
    verifyAttendanceReportURL,
    query,
  );
  return res.data;
};

export const useAPIVerifyAttendanceReport = (
  options?: UseMutationOptions<
    AttendanceRepo,
    AxiosError,
    AttendanceRepo,
    unknown
  >,
) => {
  return useMutation<AttendanceRepo, AxiosError, AttendanceRepo, unknown>(
    verifyAttendanceReport,
    options,
  );
};
