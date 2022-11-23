import { FormikErrors } from 'formik';

export const formikErrorMsgFactory = (errors: FormikErrors<any>) => {
  const keys = Object.keys(errors);
  let messages = '';
  for (const k of keys) {
    if (errors[k]) {
      messages += `${errors[k]}\n`;
    }
  }
  return messages;
};
