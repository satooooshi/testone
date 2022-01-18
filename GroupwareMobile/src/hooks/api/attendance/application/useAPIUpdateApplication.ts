import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {ApplicationBeforeJoining} from 'src/types';
import {axiosInstance} from '../../../../utils/url';
import {applicationURL} from '../../../../utils/url/attendance.url';

const updateApplication = async (body: ApplicationBeforeJoining) => {
  const res = await axiosInstance.post(applicationURL, body);
  return res.data;
};

export const useAPIUpdateApplication = (
  options?: UseMutationOptions<
    ApplicationBeforeJoining,
    AxiosError,
    Partial<ApplicationBeforeJoining>,
    unknown
  >,
) => {
  return useMutation<
    ApplicationBeforeJoining,
    AxiosError,
    ApplicationBeforeJoining,
    unknown
  >(updateApplication, options);
};
