import {useQuery} from 'react-query';
import {User} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getUsersURL} from '../../../utils/url/user.url';

const getUsers = async (all: string): Promise<User[]> => {
  const res = await axiosInstance.get<User[]>(`${getUsersURL}?status=${all}`);
  return res.data;
};

export const useAPIGetUsers = (all: string) => {
  return useQuery('getUsers', () => getUsers(all));
};
