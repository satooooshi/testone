import axios from 'axios';
import { jwtJsonHeader } from './header';

const baseURL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : process.env.API_URL
  ? process.env.API_URL
  : process.env.NODE_ENV === 'production'
  ? 'https://groupware-development-sgzkfl3uyq-an.a.run.app'
  : 'http://localhost:9000';

export const axiosInstance = axios.create({ baseURL });
axiosInstance.defaults.withCredentials = true;
axiosInstance.defaults.headers = jwtJsonHeader;
