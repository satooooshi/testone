import { useMutation, UseMutationOptions } from 'react-query';
import { axiosInstance } from 'src/utils/url';
import { logoutURL } from 'src/utils/url/auth.url';
import { jsonHeader } from 'src/utils/url/header';
import router from 'next/router';

const logout = async () => {
  const res = await axiosInstance.post(logoutURL);
  return res.data;
};

export const useAPILogout = (mutationOptions?: UseMutationOptions) => {
  return useMutation(logout, mutationOptions);
};

export const useLogout = () => {
  const { mutate: logout } = useAPILogout({
    onSuccess: () => {
      const removeLocalStorage = async () => {
        await Promise.resolve();
        localStorage.removeItem('userToken');
        axiosInstance.defaults.headers = jsonHeader;
      };
      removeLocalStorage();
      router.push('/login');
    },
  });
  return { logout };
};
