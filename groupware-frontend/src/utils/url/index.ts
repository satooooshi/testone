import axios from 'axios';
import { jwtJsonHeader } from './header';

export const baseURL = process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : 'http://localhost:9000';

export const axiosInstance = axios.create({ baseURL });
axiosInstance.defaults.withCredentials = true;
axiosInstance.defaults.headers = jwtJsonHeader;
