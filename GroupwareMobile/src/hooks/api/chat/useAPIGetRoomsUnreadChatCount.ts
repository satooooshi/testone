import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {ChatGroup} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getRoomsUnreadChatCountURL} from '../../../utils/url/chat.url';

const getRoomsUnreadChatCount = async () => {
  const res = await axiosInstance.get<ChatGroup[]>(getRoomsUnreadChatCountURL, {
    withCredentials: true,
  });
  return res.data;
};

export const useAPIGetRoomsUnreadChatCount = (
  options?: UseMutationOptions<ChatGroup[], AxiosError, unknown>,
) => {
  return useMutation<ChatGroup[], AxiosError>(getRoomsUnreadChatCount, options);
};
