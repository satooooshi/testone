import { useQuery } from 'react-query';
import { User } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getProfileURL } from 'src/utils/url/user.url';

const getProfile = async (): Promise<User> => {
  const res = await axiosInstance.get(getProfileURL);
  return res.data;
};

export const useAPIGetProfile = () => {
  return useQuery<User, Error>('getProfile', getProfile);
};
