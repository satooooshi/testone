import { useMutation, UseMutationOptions } from 'react-query';
import { QAQuestion } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { jsonHeader } from 'src/utils/url/header';
import { createBestAnswerURL } from 'src/utils/url/wiki.url';

const createBestAnswer = async (question: Partial<QAQuestion>) => {
  const response = await axiosInstance.post(createBestAnswerURL, question, {
    headers: jsonHeader,
  });
  return response.data;
};

export const useAPICreateBestAnswer = (
  mutationOptions?: UseMutationOptions<
    QAQuestion,
    Error,
    Partial<QAQuestion>,
    unknown
  >,
) => {
  return useMutation<QAQuestion, Error, Partial<QAQuestion>>(
    (q) => createBestAnswer(q),
    mutationOptions,
  );
};
