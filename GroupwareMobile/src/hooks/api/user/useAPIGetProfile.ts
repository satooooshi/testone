import {useQuery} from 'react-query';
import {User} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getProfileURL} from '../../../utils/url/user.url';

const getProfile = async (): Promise<User> => {
  const res = await axiosInstance.get<User>(getProfileURL);
  return res.data;
};

export const useAPIGetProfile = () => {
  return useQuery<User, Error>('getProfile', getProfile);
};
