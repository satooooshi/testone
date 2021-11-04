import {useMutation, UseMutationOptions} from 'react-query';
import {Wiki} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {createWikiURL} from '../../../utils/url/wiki.url';

const createWiki = async (question: Partial<Wiki>) => {
  const response = await axiosInstance.post<Wiki>(createWikiURL, question, {
    headers: jsonHeader,
  });
  return response.data;
};

export const useAPICreateWiki = (
  mutationOptions?: UseMutationOptions<Wiki, Error, Partial<Wiki>, unknown>,
) => {
  return useMutation<Wiki, Error, Partial<Wiki>>(
    q => createWiki(q),
    mutationOptions,
  );
};
