import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {ChatGroup} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {deleteChatRoomURL} from '../../../utils/url/chat.url';
import {jsonHeader} from '../../../utils/url';

const deleteChatGroup = async (chatGroup: Partial<ChatGroup>): Promise<any> => {
  const response = await axiosInstance.post(deleteChatRoomURL, chatGroup, {
    headers: jsonHeader,
  });
  return response.data;
};

export const useAPIDeleteChatRoom = (
  mutationOptions?: UseMutationOptions<
    void,
    AxiosError,
    Partial<ChatGroup>,
    unknown
  >,
) => {
  return useMutation<void, AxiosError, Partial<ChatGroup>>(
    deleteChatGroup,
    mutationOptions,
  );
};
