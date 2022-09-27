import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { AttendanceRepo } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { DeleteAttendanceReportURL } from 'src/utils/url/attendance.url';

interface deleteReportRequest {
  reportId: number;
}

const deleteAttendanceReport = async (
  body: deleteReportRequest,
): Promise<AttendanceRepo> => {
  const res = await axiosInstance.post<AttendanceRepo>(
    DeleteAttendanceReportURL,
    body,
  );
  return res.data;
};

export const useAPIDeleteAttendanceReport = (
  options?: UseMutationOptions<
    AttendanceRepo,
    AxiosError,
    deleteReportRequest,
    unknown
  >,
) => {
  return useMutation<AttendanceRepo, AxiosError, deleteReportRequest>(
    deleteAttendanceReport,
    options,
  );
};
