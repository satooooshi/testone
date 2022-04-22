import axios from 'axios';
import { jwtJsonHeader } from './header';

export const baseURL = 'https://valleyin-app-mobile-sgzkfl3uyq-an.a.run.app';

export const axiosInstance = axios.create({ baseURL });
axiosInstance.defaults.withCredentials = true;
axiosInstance.defaults.headers = jwtJsonHeader;
