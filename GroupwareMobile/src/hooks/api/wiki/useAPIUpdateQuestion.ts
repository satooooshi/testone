import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {Wiki} from '../../../types';
import {ValidateErrorResponseByServer} from '../../../utils/factory/responseEroorMsgFactory';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {updateWikiURL} from '../../../utils/url/wiki.url';

const updateWiki = async (question: Partial<Wiki>) => {
  const response = await axiosInstance.post<Wiki>(updateWikiURL, question, {
    headers: jsonHeader,
  });
  return response.data;
};

export const useAPIUpdateWiki = (
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
  >(q => updateWiki(q), mutationOptions);
};
