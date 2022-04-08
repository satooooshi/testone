import {AxiosError} from 'axios';
import {useQuery} from 'react-query';
import {ChatGroup} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getChatGroupListURL} from '../../../utils/url/chat.url';

const getChatGroupList = async (): Promise<ChatGroup[]> => {
  const response = await axiosInstance.get<ChatGroup[]>(getChatGroupListURL);
  return response.data;
};

export const useAPIGetChatGroupList = () => {
  return useQuery<ChatGroup[], AxiosError>('chatGroups', getChatGroupList);
};
