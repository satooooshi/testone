import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {Wiki} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {createBestAnswerURL} from '../../../utils/url/wiki.url';

const createBestAnswer = async (question: Partial<Wiki>) => {
  const response = await axiosInstance.post<Wiki>(
    createBestAnswerURL,
    question,
    {
      headers: jsonHeader,
    },
  );
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
    q => createBestAnswer(q),
    mutationOptions,
  );
};
