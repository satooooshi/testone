import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {AttendanceRepo} from '../../../../types';
import {ValidateErrorResponseByServer} from '../../../../utils/factory/responseEroorMsgFactory';
import {axiosInstance} from '../../../../utils/url';
import {verifyAttendanceReportURL} from '../../../../utils/url/attendance.url';

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
  >(verifyAttendanceReport, options);
};
