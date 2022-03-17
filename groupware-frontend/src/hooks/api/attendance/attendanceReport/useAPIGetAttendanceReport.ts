import { AxiosError } from 'axios';
import { useQuery, UseQueryOptions } from 'react-query';
import { AttendanceRepo } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { attendanceReportURL } from 'src/utils/url/attendance.url';

export interface GetAttendanceReportQuery {
  from_date: string;
  to_date: string;
}

const getAttendanceReport = async (
  query: GetAttendanceReportQuery,
): Promise<AttendanceRepo[]> => {
  const { from_date: fromDate, to_date: toDate } = query;
  const response = await axiosInstance.get<AttendanceRepo[]>(
    attendanceReportURL + `?from_date=${fromDate}&to_date=${toDate}`,
  );
  return response.data;
};

export const useAPIGetAttendanceReport = (
  query: GetAttendanceReportQuery,
  options?: UseQueryOptions<AttendanceRepo[], AxiosError>,
) => {
  return useQuery<AttendanceRepo[], AxiosError>(
    ['getAttendanceReport', query],
    () => getAttendanceReport(query),
    options,
  );
};
