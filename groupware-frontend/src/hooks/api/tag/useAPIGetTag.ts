import { AxiosError } from 'axios';
import { useQuery } from 'react-query';
import { Tag } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getTagListURL } from 'src/utils/url/tag.url';

const getTag = async (): Promise<Tag[]> => {
  const res = await axiosInstance.get(getTagListURL);
  return res.data;
};

export const useAPIGetTag = () => {
  return useQuery<Tag[], AxiosError>('tags', getTag);
};
