import { useMutation, UseMutationOptions } from 'react-query';
import { SubmissionFile } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { saveSubmissionURL } from 'src/utils/url/event.url';
import { jsonHeader } from 'src/utils/url/header';

const saveSubmission = async (
  submissionFile: SubmissionFile[],
): Promise<SubmissionFile[]> => {
  const res = await axiosInstance.post(saveSubmissionURL, submissionFile, {
    headers: jsonHeader,
  });
  return res.data;
};

export const useAPISaveSubmission = (
  mutationOptions?: UseMutationOptions<
    SubmissionFile[],
    Error,
    SubmissionFile[],
    unknown
  >,
) => {
  return useMutation<SubmissionFile[], Error, SubmissionFile[]>(
    saveSubmission,
    mutationOptions,
  );
};
