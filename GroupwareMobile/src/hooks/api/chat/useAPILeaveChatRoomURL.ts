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
    Error,
    Partial<ChatGroup>,
    unknown
  >,
) => {
  return useMutation<void, Error, Partial<ChatGroup>>(
    leaveChatGroup,
    mutationOptions,
  );
};
