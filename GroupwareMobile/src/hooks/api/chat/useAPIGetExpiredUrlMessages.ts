import {useQuery, UseQueryOptions} from 'react-query';
import {axiosInstance} from '../../../utils/url';
import {ChatMessage} from '../../../types';
import {getExpiredUrlMessagesURL} from '../../../utils/url/chat.url';
import {AxiosError} from 'axios';

const getExpiredUrlMessages = async (query: number) => {
  const res = await axiosInstance.get<ChatMessage[]>(
    getExpiredUrlMessagesURL + '/' + query,
  );
  return res.data;
};

export const useAPIGetExpiredUrlMessages = (
  query: number,
  options?: UseQueryOptions<ChatMessage[], AxiosError>,
) => {
  return useQuery<ChatMessage[], AxiosError>(
    ['getExpiredUrlMessages', query],
    () => getExpiredUrlMessages(query),
    options,
  );
};
