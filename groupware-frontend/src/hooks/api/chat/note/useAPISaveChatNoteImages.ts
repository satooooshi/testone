import { AxiosError } from 'axios';
import { useMutation, UseQueryOptions } from 'react-query';
import { ChatNoteImage } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { noteImageURL } from 'src/utils/url/chat.url';

const saveNoteImage = async (query: Partial<ChatNoteImage>[]) => {
  const res = await axiosInstance.post<ChatNoteImage[]>(noteImageURL, query);
  return res.data;
};

export const useAPISaveNoteImage = (
  options?: UseQueryOptions<Partial<ChatNoteImage>[], AxiosError>,
) => {
  return useMutation<
    ChatNoteImage[],
    AxiosError,
    Partial<ChatNoteImage>[],
    unknown
  >(saveNoteImage, options);
};
