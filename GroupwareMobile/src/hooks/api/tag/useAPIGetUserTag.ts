import {useQuery} from 'react-query';
import {UserTag} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getUserTagListURL} from '../../../utils/url/tag.url';

const getUserTag = async (): Promise<UserTag[]> => {
  const res = await axiosInstance.get<UserTag[]>(getUserTagListURL);
  return res.data;
};

export const useAPIGetUserTag = () => {
  return useQuery<UserTag[], Error>('userTags', getUserTag);
};
