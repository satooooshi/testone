import { AxiosError } from 'axios';

export const responseErrorMsgFactory = (error: AxiosError) => {
  if (error?.response?.status === 500) {
    return 'サーバーエラーが発生しました。しばらくしてからお試しください';
  }
  const errorMsg = error?.response?.data.message;
  if (typeof errorMsg === 'string') {
    return errorMsg;
  }
  let messages = '';
  for (const e of error?.response?.data.message) {
    messages += `${e}\n`;
  }
  return messages;
};
