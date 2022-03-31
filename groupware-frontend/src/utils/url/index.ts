import axios from 'axios';
import { jwtJsonHeader } from './header';

export const baseURL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.API_URL
  ? process.env.API_URL
  : process.env.NODE_ENV === 'production'
  ? 'https://groupware-mobile--dev-test-sgzkfl3uyq-an.a.run.app'
  : 'https://groupware-mobile--dev-test-sgzkfl3uyq-an.a.run.app';

export const axiosInstance = axios.create({ baseURL });
axiosInstance.defaults.withCredentials = true;
axiosInstance.defaults.headers = jwtJsonHeader;
