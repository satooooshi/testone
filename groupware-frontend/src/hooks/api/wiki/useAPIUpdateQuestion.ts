import { useMutation, UseMutationOptions } from 'react-query';
import { QAQuestion } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { jsonHeader } from 'src/utils/url/header';
import { updateQuestionURL } from 'src/utils/url/wiki.url';

const updateWiki = async (question: Partial<QAQuestion>) => {
  const response = await axiosInstance.post(updateQuestionURL, question, {
    headers: jsonHeader,
  });
  return response.data;
};

export const useAPIUpdateWiki = (
  mutationOptions?: UseMutationOptions<
    QAQuestion,
    Error,
    Partial<QAQuestion>,
    unknown
  >,
) => {
  return useMutation<QAQuestion, Error, Partial<QAQuestion>>(
    (q) => updateWiki(q),
    mutationOptions,
  );
};
