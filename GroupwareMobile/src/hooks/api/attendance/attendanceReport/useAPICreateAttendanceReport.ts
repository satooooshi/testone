import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {AttendanceReport} from '../../../../types';
import {ValidateErrorResponseByServer} from '../../../../utils/factory/responseEroorMsgFactory';
import {axiosInstance} from '../../../../utils/url';
import {attendanceReportURL} from '../../../../utils/url/attendance.url';

const createAttendanceReport = async (query: Partial<AttendanceReport>) => {
  const res = await axiosInstance.post<AttendanceReport>(
    attendanceReportURL,
    query,
  );
  return res.data;
};

export const useAPICreateAttendanceReport = (
  options?: UseMutationOptions<
    AttendanceReport,
    AxiosError<ValidateErrorResponseByServer>,
    Partial<AttendanceReport>,
    unknown
  >,
) => {
  return useMutation<
    AttendanceReport,
    AxiosError<ValidateErrorResponseByServer>,
    Partial<AttendanceReport>,
    unknown
  >(createAttendanceReport, options);
};
