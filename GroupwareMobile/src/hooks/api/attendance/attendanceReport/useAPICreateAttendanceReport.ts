import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {AttendanceRepo} from '../../../../types';
import {ValidateErrorResponseByServer} from '../../../../utils/factory/responseEroorMsgFactory';
import {axiosInstance} from '../../../../utils/url';
import {attendanceReportURL} from '../../../../utils/url/attendance.url';

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
    AxiosError<ValidateErrorResponseByServer>,
    Partial<AttendanceRepo>,
    unknown
  >,
) => {
  return useMutation<
    AttendanceRepo,
    AxiosError<ValidateErrorResponseByServer>,
    Partial<AttendanceRepo>,
    unknown
  >(createAttendanceReport, options);
};
