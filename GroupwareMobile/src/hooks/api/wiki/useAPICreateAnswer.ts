import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {QAAnswer} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {createAnswerURL} from '../../../utils/url/wiki.url';

const createAnswer = async (answer: Partial<QAAnswer>): Promise<QAAnswer> => {
  const resposne = await axiosInstance.post<QAAnswer>(createAnswerURL, answer, {
    headers: jsonHeader,
  });
  return resposne.data;
};

export const useAPICreateAnswer = (
  mutationOptions?: UseMutationOptions<
    QAAnswer,
    AxiosError,
    Partial<QAAnswer>,
    unknown
  >,
) => {
  return useMutation<QAAnswer, AxiosError, Partial<QAAnswer>>(
    createAnswer,
    mutationOptions,
  );
};
