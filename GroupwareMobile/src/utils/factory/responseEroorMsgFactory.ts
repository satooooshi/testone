import {AxiosError} from 'axios';

export type ValidateErrorResponseByServer = {
  error: string;
  message: string[];
  statusCode: number;
};

export const responseErrorMsgFactory = (
  errors: AxiosError<ValidateErrorResponseByServer>,
) => {
  if (errors?.response?.status !== 400) {
    return 'サーバー内部でエラーが発生しました。しばらくしてからお試しください';
  }
  let messages = '';
  errors.response.data.message.forEach((element, index) => {
    if (index === 0) {
      messages += element;
      return;
    }
    messages += `\n${element}`;
  });
  return messages;
};
