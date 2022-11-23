import {AxiosError} from 'axios';
import {useMutation, UseMutationOptions} from 'react-query';
import {ChatGroup} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {savePinURL} from '../../../utils/url/chat.url';

const savePin = async (chatGroup: Partial<ChatGroup>): Promise<ChatGroup> => {
  const response = await axiosInstance.post<ChatGroup>(savePinURL, chatGroup);
  return response.data;
};

export const useAPISavePin = (
  mutationOptions?: UseMutationOptions<
    ChatGroup,
    AxiosError,
    Partial<ChatGroup>,
    unknown
  >,
) => {
  return useMutation<ChatGroup, AxiosError, Partial<ChatGroup>>(
    savePin,
    mutationOptions,
  );
};
