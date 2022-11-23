import {useMutation, UseMutationOptions} from 'react-query';
import {axiosInstance} from '../../../utils/url';
import {logoutURL} from '../../../utils/url/auth.url';

const logout = async () => {
  const res = await axiosInstance.post(logoutURL);
  return res.data;
};

export const useAPILogout = (mutationOptions?: UseMutationOptions) => {
  return useMutation(logout, mutationOptions);
};
