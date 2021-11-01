import {useQuery} from 'react-query';
import {axiosInstance} from '../../../utils/url';
import {Wiki} from '../../../types';
import {getWikiDetailURL} from '../../../utils/url/wiki.url';

const getWikiDetail = async (id: number) => {
  const res = await axiosInstance.get<Wiki>(`${getWikiDetailURL}/${id}`);
  return res.data;
};

export const useAPIGetWikiDetail = (id: number) => {
  return useQuery<Wiki, Error>(['questionDetail', {id}], () =>
    getWikiDetail(id),
  );
};
