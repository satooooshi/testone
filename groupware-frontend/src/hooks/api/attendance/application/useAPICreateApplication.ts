import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { ApplicationBeforeJoining } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { applicationURL } from 'src/utils/url/attendance.url';

const createApplication = async (body: Partial<ApplicationBeforeJoining>) => {
  const res = await axiosInstance.post(applicationURL, body);
  return res.data;
};

export const useAPICreateApplication = (
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
    Partial<ApplicationBeforeJoining>,
    unknown
  >(createApplication, options);
};
