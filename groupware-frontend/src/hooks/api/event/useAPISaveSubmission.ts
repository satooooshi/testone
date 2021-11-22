import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { SubmissionFile } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { saveSubmissionURL } from 'src/utils/url/event.url';
import { jsonHeader } from 'src/utils/url/header';

const saveSubmission = async (
  submissionFile: Partial<SubmissionFile>[],
): Promise<SubmissionFile[]> => {
  const res = await axiosInstance.post(saveSubmissionURL, submissionFile, {
    headers: jsonHeader,
  });
  return res.data;
};

export const useAPISaveSubmission = (
  mutationOptions?: UseMutationOptions<
    SubmissionFile[],
    AxiosError,
    Partial<SubmissionFile>[],
    unknown
  >,
) => {
  return useMutation<SubmissionFile[], AxiosError, Partial<SubmissionFile>[]>(
    saveSubmission,
    mutationOptions,
  );
};
