import {useQuery} from 'react-query';
import {User} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getUsersURL} from '../../../utils/url/user.url';

const getUsers = async (status: 'ALL' | ''): Promise<User[]> => {
  const res = await axiosInstance.get<User[]>(
    `${getUsersURL}?status=${status}`,
  );
  return res.data;
};

export const useAPIGetUsers = (status: 'ALL' | '') => {
  return useQuery('getUsers', () => getUsers(status));
};
