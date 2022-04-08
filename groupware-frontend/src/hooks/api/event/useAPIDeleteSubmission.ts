import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { axiosInstance } from 'src/utils/url';
import { deleteSubmissionURL } from 'src/utils/url/event.url';
import { jsonHeader } from 'src/utils/url/header';

interface deleteSubmissionRequest {
  submissionId: number;
}

const apiDeleteSubmission = async (body: deleteSubmissionRequest) => {
  const res = await axiosInstance.post(deleteSubmissionURL, body, {
    headers: jsonHeader,
  });
  return res.data;
};

export const useAPIDeleteSubmission = (
  mutationOptions?: UseMutationOptions<
    unknown,
    AxiosError,
    deleteSubmissionRequest,
    unknown
  >,
) => {
  return useMutation<unknown, AxiosError, deleteSubmissionRequest>(
    apiDeleteSubmission,
    mutationOptions,
  );
};
