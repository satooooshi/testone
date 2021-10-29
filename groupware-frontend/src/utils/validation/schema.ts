import * as Yup from 'yup';

const requireMessage = '入力必須です';
const emailFormatMessage = 'メールアドレスの形式で入力してください';
const blankMixedMessage = '空白文字は使用できません';
const minEightTextMessage = '8文字以上で入力してください';
const minDateMessage = '開始日時は終了日時より前に設定して下さい';
const minTagsMessage = 'タグは一つ以上設定してください';
const unmatchPasswordConfirmation = '再入力と新しいパスワードが一致しません';
// const minHostUsersMessage = '開催者/講師は一人以上設定してください';

export const loginSchema = Yup.object().shape({
  email: Yup.string().email(emailFormatMessage).required(requireMessage),
  password: Yup.string()
    .matches(/^([^ ]*)$/, blankMixedMessage)
    .min(8, minEightTextMessage)
    .required(requireMessage),
});

export const wikiSchema = Yup.object().shape({
  title: Yup.string().required(requireMessage),
  body: Yup.string().required(requireMessage),
});

export const updatePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required(requireMessage),
  newPassword: Yup.string()
    .matches(/^([^ ]*)$/, blankMixedMessage)
    .min(8, minEightTextMessage)
    .required(requireMessage),
  newPasswordConfirmation: Yup.string().oneOf(
    [Yup.ref('newPassword'), null],
    unmatchPasswordConfirmation,
  ),
});

export const registerSchema = Yup.object().shape({
  firstName: Yup.string().required(requireMessage),
  lastName: Yup.string().required(requireMessage),
  email: Yup.string().email(emailFormatMessage).required(requireMessage),
  password: Yup.string()
    .matches(/^([^ ]*)$/, blankMixedMessage)
    .min(8, minEightTextMessage)
    .required(requireMessage),
});

export const createEventSchema = Yup.object().shape({
  title: Yup.string().required(`タイトルは${requireMessage}`),
  startAt: Yup.date().required(`開始日時は${requireMessage}`),
  endAt: Yup.date()
    .min(Yup.ref('startAt'), minDateMessage)
    .required(`終了日時は${requireMessage}`),
  tags: Yup.array().min(1, minTagsMessage),
});
