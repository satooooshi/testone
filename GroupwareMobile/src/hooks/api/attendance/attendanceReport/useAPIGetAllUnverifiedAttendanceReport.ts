import {AxiosError} from 'axios';
import {useQuery, UseQueryOptions} from 'react-query';
import {AttendanceRepo} from '../../../../types';
import {axiosInstance} from '../../../../utils/url';
import {allUnverifiedAttendanceReportURL} from '../../../../utils/url/attendance.url';

export interface GetAttendanceReportQuery {
  from_date: string;
  to_date: string;
}

const getAllUnverifiedAttendanceReport = async (
  query: GetAttendanceReportQuery,
): Promise<AttendanceRepo[]> => {
  const {from_date: fromDate, to_date: toDate} = query;
  const response = await axiosInstance.get<AttendanceRepo[]>(
    allUnverifiedAttendanceReportURL +
      `?from_date=${fromDate}&to_date=${toDate}`,
  );
  return response.data;
};

export const useAPIGetAllUnverifiedAttendanceReport = (
  query: GetAttendanceReportQuery,
  options?: UseQueryOptions<AttendanceRepo[], AxiosError>,
) => {
  return useQuery<AttendanceRepo[], AxiosError>(
    ['getAllUnverifiedAttendanceReport', query],
    () => getAllUnverifiedAttendanceReport(query),
    options,
  );
};
