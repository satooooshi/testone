import {AxiosError} from 'axios';
import {useQuery, UseQueryOptions} from 'react-query';
import {DefaultAttendance} from 'src/types';
import {axiosInstance} from '../../../utils/url';
import {defaultAttendanceURL} from '../../../utils/url/attendance.url';

const getDefaultAttendance = async () => {
  const res = await axiosInstance.get<DefaultAttendance>(defaultAttendanceURL);
  return res.data;
};

export const useAPIGetDefaultAttendance = (
  options?: UseQueryOptions<DefaultAttendance, AxiosError>,
) => {
  return useQuery<DefaultAttendance, AxiosError>(
    'getDefaultAttendance',
    getDefaultAttendance,
    options,
  );
};
