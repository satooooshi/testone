import { useMutation, UseMutationOptions } from 'react-query';
import { QAQuestion } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { jsonHeader } from 'src/utils/url/header';
import { createQuestionURL } from 'src/utils/url/wiki.url';

const createWiki = async (question: Partial<QAQuestion>) => {
  const response = await axiosInstance.post(createQuestionURL, question, {
    headers: jsonHeader,
  });
  return response.data;
};

export const useAPICreateWiki = (
  mutationOptions?: UseMutationOptions<
    QAQuestion,
    Error,
    Partial<QAQuestion>,
    unknown
  >,
) => {
  return useMutation<QAQuestion, Error, Partial<QAQuestion>>(
    (q) => createWiki(q),
    mutationOptions,
  );
};
