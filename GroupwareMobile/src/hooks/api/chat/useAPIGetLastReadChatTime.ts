import {useQuery, UseQueryOptions} from 'react-query';
import {axiosInstance} from '../../../utils/url';
import {getLastReadChatTimeURL} from '../../../utils/url/chat.url';
import {LastReadChatTime} from '../../../types';
import {AxiosError} from 'axios';

const getLastReadChatTime = async (query: number) => {
  const res = await axiosInstance.get<LastReadChatTime[]>(
    getLastReadChatTimeURL + '/' + query,
  );
  return res.data;
};

export const useAPIGetLastReadChatTime = (
  query: number,
  options?: UseQueryOptions<LastReadChatTime[], AxiosError>,
) => {
  return useQuery<LastReadChatTime[], AxiosError>(
    ['getLastReadChatTime', query],
    () => getLastReadChatTime(query),
    options,
  );
};
