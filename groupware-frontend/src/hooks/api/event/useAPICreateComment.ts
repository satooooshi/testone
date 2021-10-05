import { useMutation, UseMutationOptions } from 'react-query';
import { EventComment } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { createCommentURL } from 'src/utils/url/event.url';
import { jsonHeader } from 'src/utils/url/header';

const createComment = async (
  answer: Partial<EventComment>,
): Promise<EventComment> => {
  const resposne = await axiosInstance.post(createCommentURL, answer, {
    headers: jsonHeader,
  });
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
