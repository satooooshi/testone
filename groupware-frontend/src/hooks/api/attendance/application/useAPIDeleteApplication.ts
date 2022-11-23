import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { ApplicationBeforeJoining } from '../../../../types';
import { axiosInstance } from '../../../../utils/url';
import { deleteApplicationURL } from '../../../../utils/url/attendance.url';

interface deleteApplicationRequest {
  applicationId: number;
}

const deleteApplication = async (
  body: deleteApplicationRequest,
): Promise<ApplicationBeforeJoining> => {
  const res = await axiosInstance.post<ApplicationBeforeJoining>(
    deleteApplicationURL,
    body,
  );

  return res.data;
};

export const useAPIDeleteApplication = (
  options?: UseMutationOptions<
    ApplicationBeforeJoining,
    AxiosError,
    deleteApplicationRequest,
    unknown
  >,
) => {
  return useMutation<
    ApplicationBeforeJoining,
    AxiosError,
    deleteApplicationRequest
  >(deleteApplication, options);
};
