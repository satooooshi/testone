import { useMutation, UseMutationOptions } from 'react-query';
import { Wiki } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { jsonHeader } from 'src/utils/url/header';
import { createWikiURL } from 'src/utils/url/wiki.url';

const createWiki = async (question: Partial<Wiki>) => {
  const response = await axiosInstance.post(createWikiURL, question, {
    headers: jsonHeader,
  });
  return response.data;
};

export const useAPICreateWiki = (
  mutationOptions?: UseMutationOptions<Wiki, Error, Partial<Wiki>, unknown>,
) => {
  return useMutation<Wiki, Error, Partial<Wiki>>(
    (q) => createWiki(q),
    mutationOptions,
  );
};
