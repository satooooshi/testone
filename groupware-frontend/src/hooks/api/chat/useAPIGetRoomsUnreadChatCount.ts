import { AxiosError } from 'axios';
import { useMutation, UseMutationOptions } from 'react-query';
import { ChatGroup } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getRoomsUnreadChatCountURL } from 'src/utils/url/chat.url';

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
