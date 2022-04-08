import {AxiosError} from 'axios';
import {useQuery} from 'react-query';
import {Tag} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getTagListURL} from '../../../utils/url/tag.url';

const getTag = async (): Promise<Tag[]> => {
  const res = await axiosInstance.get<Tag[]>(getTagListURL);
  return res.data;
};

export const useAPIGetTag = () => {
  return useQuery<Tag[], AxiosError>('tags', getTag);
};
