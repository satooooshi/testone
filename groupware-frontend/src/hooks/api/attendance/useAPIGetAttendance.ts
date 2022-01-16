import { AxiosError } from 'axios';
import { useQuery, UseQueryOptions } from 'react-query';
import { Attendance } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { attendanceURL } from 'src/utils/url/attendance.url';

export interface GetAttendanceQuery {
  from_date: string;
  to_date: string;
}

const getAttendance = async (
  query: GetAttendanceQuery,
): Promise<Attendance[]> => {
  const { from_date: fromDate, to_date: toDate } = query;
  const response = await axiosInstance.get<Attendance[]>(
    attendanceURL + `?from_date=${fromDate}&to_date=${toDate}`,
  );
  return response.data;
};

export const useAPIGetAttendace = (
  query: GetAttendanceQuery,
  options?: UseQueryOptions<Attendance[], AxiosError>,
) => {
  return useQuery<Attendance[], AxiosError>(
    ['getAttendance', query],
    () => getAttendance(query),
    options,
  );
};
