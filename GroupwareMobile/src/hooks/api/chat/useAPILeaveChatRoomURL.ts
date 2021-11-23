import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {ChatGroup} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {leaveChatRoomURL} from '../../../utils/url/chat.url';

const leaveChatGroup = async (chatGroup: Partial<ChatGroup>) => {
  const response = await axiosInstance.post<void>(leaveChatRoomURL, chatGroup, {
    headers: jsonHeader,
  });
  return response.data;
};

export const useAPILeaveChatRoom = (
  mutationOptions?: UseMutationOptions<
    void,
    AxiosError,
    Partial<ChatGroup>,
    unknown
  >,
) => {
  return useMutation<void, AxiosError, Partial<ChatGroup>>(
    leaveChatGroup,
    mutationOptions,
  );
};
