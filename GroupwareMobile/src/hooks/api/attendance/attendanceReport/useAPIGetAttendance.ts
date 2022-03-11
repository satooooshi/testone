import {AxiosError} from 'axios';
import {useQuery, UseQueryOptions} from 'react-query';
import {AttendanceReport} from '../../../../types';
import {axiosInstance} from '../../../../utils/url';
import {attendanceReportURL} from '../../../../utils/url/attendance.url';

export interface GetAttendanceReportQuery {
  from_date: string;
  to_date: string;
}

const getAttendance = async (
  query: GetAttendanceReportQuery,
): Promise<AttendanceReport[]> => {
  const {from_date: fromDate, to_date: toDate} = query;
  const response = await axiosInstance.get<AttendanceReport[]>(
    attendanceReportURL + `?from_date=${fromDate}&to_date=${toDate}`,
  );
  return response.data;
};

export const useAPIGetAttendace = (
  query: GetAttendanceReportQuery,
  options?: UseQueryOptions<AttendanceReport[], AxiosError>,
) => {
  return useQuery<AttendanceReport[], AxiosError>(
    ['getAttendanceReport', query],
    () => getAttendance(query),
    options,
  );
};
