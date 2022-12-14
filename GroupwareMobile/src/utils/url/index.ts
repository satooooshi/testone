import axios from 'axios';
import {MMKV} from 'react-native-mmkv';
import Config from 'react-native-config';

export const storage = new MMKV();

export const tokenString = (): string => {
  return storage.getString('userToken') || '';
};
export const jsonHeader = {
  'Content-Type': 'application/json',
};
export const httpHeader = {
  'Content-Type': 'application/json',
};
export const jwtJsonHeader = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${tokenString()}`,
};
export const jwtFormDataHeader = {
  'Content-Type': 'multipart/form-data',
  Authorization: `Bearer ${tokenString()}`,
};

export const baseURL =
  __DEV__ && Config.API_URL
    ? Config.API_URL
    : !__DEV__
    ? 'https://groupware-development-sgzkfl3uyq-an.a.run.app'
    : 'http://localhost:9000';

export const markdownEditorURL =
  Config.MARKDOWN_EDITOR_URL || 'http://localhost:8080';

export const axiosInstance = axios.create({baseURL});
axiosInstance.defaults.withCredentials = true;
axiosInstance.defaults.headers.common = jwtJsonHeader;

export const generateClientURL = (path: string) => {
  if (__DEV__) {
    return 'http://localhost:3000' + path;
  } else {
    return 'https://groupware-frontend-theta.vercel.app' + path;
  }
};
