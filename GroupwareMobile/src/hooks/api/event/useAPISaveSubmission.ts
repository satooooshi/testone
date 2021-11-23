import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {SubmissionFile} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {saveSubmissionURL} from '../../../utils/url/event.url';

const saveSubmission = async (
  submissionFile: Partial<SubmissionFile>[],
): Promise<SubmissionFile[]> => {
  const res = await axiosInstance.post<SubmissionFile[]>(
    saveSubmissionURL,
    submissionFile,
    {
      headers: jsonHeader,
    },
  );
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
