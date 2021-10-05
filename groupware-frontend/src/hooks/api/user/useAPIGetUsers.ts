import { useQuery } from 'react-query';
import { User } from 'src/types';
import { axiosInstance } from 'src/utils/url';
import { getUsersURL } from 'src/utils/url/user.url';

const getUsers = async (): Promise<User[]> => {
  const res = await axiosInstance.get(getUsersURL);
  return res.data;
};

export const useAPIGetUsers = () => {
  return useQuery('getUsers', getUsers);
};
