import * as Yup from 'yup';

const requireMessage = '入力必須です';
const emailFormatMessage = 'メールアドレスの形式で入力してください';
const blankMixedMessage = '空白文字は使用できません';
const minEightTextMessage = '8文字以上で入力してください';
const minDateMessage = '開始日時は終了日時より前に設定してください';
const minTagsMessage = 'タグは一つ以上設定してください';
const unmatchPasswordConfirmation = '再入力と新しいパスワードが一致しません';
const nWordLimitMessage = (len: number) => `${len}文字以内で入力してください`;
const afterNowMessage = '現在の日時以降に設定してください';
// const minHostUsersMessage = '開催者/講師は一人以上設定してください';
const minRoomUserMessage = 'トークルームには一人以上の社員を招待してください';

export const loginSchema = Yup.object().shape({
  email: Yup.string().email(emailFormatMessage).required(requireMessage),
  password: Yup.string()
    .matches(/^([^ ]*)$/, blankMixedMessage)
    .min(8, minEightTextMessage)
    .required(requireMessage),
});

export const wikiSchema = Yup.object().shape({
  title: Yup.string().required(requireMessage).max(100, nWordLimitMessage(100)),
  body: Yup.string().required(requireMessage),
});

export const answerSchema = Yup.object().shape({
  body: Yup.string().required(requireMessage),
});

export const replySchema = Yup.object().shape({
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

export const savingEventSchema = Yup.object().shape({
  title: Yup.string()
    .required(`タイトルは${requireMessage}`)
    .max(100, `タイトルは${nWordLimitMessage(100)}`),
  startAt: Yup.date()
    .required(`開始日時は${requireMessage}`)
    .min(new Date(), `開始日時は${afterNowMessage}`),
  endAt: Yup.date()
    .min(Yup.ref('startAt'), minDateMessage)
    .required(`終了日時は${requireMessage}`),
  tags: Yup.array().min(1, minTagsMessage),
});

export const savingRoomSchema = Yup.object().shape({
  name: Yup.string()
    .required(`グループ名は${requireMessage}`)
    .max(50, `グループ名は${nWordLimitMessage(50)}`),
  members: Yup.array().min(1, minRoomUserMessage),
});

export const profileSchema = Yup.object().shape({
  email: Yup.string()
    .email(emailFormatMessage)
    .required(`メールアドレスは${requireMessage}`),
  lastName: Yup.string()
    .required(`姓は${requireMessage}`)
    .max(50, `姓は${nWordLimitMessage(50)}`),
  firstName: Yup.string()
    .required(`名は${requireMessage}`)
    .max(50, `名は${nWordLimitMessage(50)}`),
  introduceOther: Yup.string().max(
    1000,
    `自己紹介は${nWordLimitMessage(1000)}`,
  ),
  introduceTech: Yup.string().max(
    1000,
    `技術の紹介は${nWordLimitMessage(1000)}`,
  ),
  introduceQualification: Yup.string().max(
    1000,
    `資格の紹介は${nWordLimitMessage(1000)}`,
  ),
  introduceClub: Yup.string().max(
    1000,
    `部活動の紹介は${nWordLimitMessage(1000)}`,
  ),
  introduceHobby: Yup.string().max(
    1000,
    `趣味の紹介は${nWordLimitMessage(1000)}`,
  ),
});
