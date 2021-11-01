import {useMutation, UseMutationOptions} from 'react-query';
import {EventComment} from '../../../types';
import {axiosInstance, jsonHeader} from '../../../utils/url';
import {createCommentURL} from '../../../utils/url/event.url';

const createComment = async (
  answer: Partial<EventComment>,
): Promise<EventComment> => {
  const resposne = await axiosInstance.post<EventComment>(
    createCommentURL,
    answer,
    {
      headers: jsonHeader,
    },
  );
  return resposne.data;
};

export const useAPICreateComment = (
  mutationOptions?: UseMutationOptions<
    EventComment,
    Error,
    Partial<EventComment>,
    unknown
  >,
) => {
  return useMutation<EventComment, Error, Partial<EventComment>>(
    createComment,
    mutationOptions,
  );
};
