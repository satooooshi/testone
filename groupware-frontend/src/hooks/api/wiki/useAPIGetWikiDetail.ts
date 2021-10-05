import { useQuery } from 'react-query';
import { QAQuestion } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getWikiDetailURL } from 'src/utils/url/wiki.url';

const getWikiDetail = async (id: string) => {
  const res = await axiosInstance.get(`${getWikiDetailURL}/${id}`);
  return res.data;
};

export const useAPIGetWikiDetail = (id: string) => {
  return useQuery<QAQuestion, Error>(['questionDetail', { id }], () =>
    getWikiDetail(id),
  );
};
