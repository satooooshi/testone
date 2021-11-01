import {useMutation, UseMutationOptions} from 'react-query';
import {UserJoiningEvent} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {saveUserJoiningEventURL} from '../../../utils/url/event.url';

const saveUserJoiningEvent = async (
  userJoiningEvent: UserJoiningEvent,
): Promise<UserJoiningEvent> => {
  const res = await axiosInstance.post<UserJoiningEvent>(
    saveUserJoiningEventURL,
    userJoiningEvent,
  );
  return res.data;
};

export const useAPISaveUserJoiningEvent = (
  mutationOptions?: UseMutationOptions<
    UserJoiningEvent,
    Error,
    UserJoiningEvent,
    unknown
  >,
) => {
  return useMutation<UserJoiningEvent, Error, UserJoiningEvent>(
    saveUserJoiningEvent,
    mutationOptions,
  );
};
