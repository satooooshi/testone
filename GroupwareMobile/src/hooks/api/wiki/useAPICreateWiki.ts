import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {Wiki} from '../../../types';
import {ValidateErrorResponseByServer} from '../../../utils/factory/responseEroorMsgFactory';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {createWikiURL} from '../../../utils/url/wiki.url';

const createWiki = async (question: Partial<Wiki>) => {
  const response = await axiosInstance.post<Wiki>(createWikiURL, question, {
    headers: jsonHeader,
  });
  return response.data;
};

export const useAPICreateWiki = (
  mutationOptions?: UseMutationOptions<
    Wiki,
    AxiosError<ValidateErrorResponseByServer>,
    Partial<Wiki>,
    unknown
  >,
) => {
  return useMutation<
    Wiki,
    AxiosError<ValidateErrorResponseByServer>,
    Partial<Wiki>
  >(q => createWiki(q), mutationOptions);
};
