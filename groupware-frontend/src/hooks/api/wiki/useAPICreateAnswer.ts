import { useMutation, UseMutationOptions } from 'react-query';
import { QAAnswer } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { jsonHeader } from 'src/utils/url/header';
import { createAnswerURL } from 'src/utils/url/wiki.url';

const createAnswer = async (answer: Partial<QAAnswer>): Promise<QAAnswer> => {
  const resposne = await axiosInstance.post(createAnswerURL, answer, {
    headers: jsonHeader,
  });
  return resposne.data;
};

export const useAPICreateAnswer = (
  mutationOptions?: UseMutationOptions<
    QAAnswer,
    Error,
    Partial<QAAnswer>,
    unknown
  >,
) => {
  return useMutation<QAAnswer, Error, Partial<QAAnswer>>(
    createAnswer,
    mutationOptions,
  );
};
