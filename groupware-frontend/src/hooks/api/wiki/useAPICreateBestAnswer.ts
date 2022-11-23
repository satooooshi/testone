import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { Wiki } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { jsonHeader } from 'src/utils/url/header';
import { createBestAnswerURL } from 'src/utils/url/wiki.url';

const createBestAnswer = async (question: Partial<Wiki>) => {
  const response = await axiosInstance.post(createBestAnswerURL, question, {
    headers: jsonHeader,
  });
  return response.data;
};

export const useAPICreateBestAnswer = (
  mutationOptions?: UseMutationOptions<
    Wiki,
    AxiosError,
    Partial<Wiki>,
    unknown
  >,
) => {
  return useMutation<Wiki, AxiosError, Partial<Wiki>>(
    (q) => createBestAnswer(q),
    mutationOptions,
  );
};
