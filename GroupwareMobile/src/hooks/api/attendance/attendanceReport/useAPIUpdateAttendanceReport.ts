import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {AttendanceRepo} from '../../../../types';
import {ValidateErrorResponseByServer} from '../../../../utils/factory/responseEroorMsgFactory';
import {axiosInstance} from '../../../../utils/url';
import {attendanceReportURL} from '../../../../utils/url/attendance.url';

const updateAttendanceReport = async (query: AttendanceRepo) => {
  const res = await axiosInstance.patch<AttendanceRepo>(
    attendanceReportURL,
    query,
  );
  return res.data;
};

export const useAPIUpdateAttendanceReport = (
  options?: UseMutationOptions<
    AttendanceRepo,
    AxiosError<ValidateErrorResponseByServer>,
    AttendanceRepo,
    unknown
  >,
) => {
  return useMutation<
    AttendanceRepo,
    AxiosError<ValidateErrorResponseByServer>,
    AttendanceRepo,
    unknown
  >(updateAttendanceReport, options);
};
