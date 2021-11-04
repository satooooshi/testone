import {useQuery} from 'react-query';
import {User} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getUsersURL} from '../../../utils/url/user.url';

const getUsers = async (): Promise<User[]> => {
  const res = await axiosInstance.get<User[]>(getUsersURL);
  return res.data;
};

export const useAPIGetUsers = () => {
  return useQuery('getUsers', getUsers);
};
