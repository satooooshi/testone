import {AxiosError} from 'axios';
import {useQuery, UseQueryOptions} from 'react-query';
import {User} from '../../../types';
import {axiosInstance} from '../../../utils/url';
import {getUsersURL} from '../../../utils/url/user.url';

const getUsers = async (status: 'ALL' | ''): Promise<User[]> => {
  const res = await axiosInstance.get<User[]>(
    `${getUsersURL}?status=${status}`,
  );
  return res.data;
};

export const useAPIGetUsers = (
  status: 'ALL' | '',
  useQueryOptions?: UseQueryOptions<User[], AxiosError>,
) => {
  return useQuery<User[], AxiosError>(
    'getUsers',
    () => getUsers(status),
    useQueryOptions,
  );
};
