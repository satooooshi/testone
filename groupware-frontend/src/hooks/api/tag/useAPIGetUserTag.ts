import { useQuery } from 'react-query';
import { UserTag } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getUserTagListURL } from 'src/utils/url/tag.url';

const getUserTag = async (): Promise<UserTag[]> => {
  const res = await axiosInstance.get(getUserTagListURL);
  return res.data;
};

export const useAPIGetUserTag = () => {
  return useQuery<UserTag[], Error>('userTags', getUserTag);
};
