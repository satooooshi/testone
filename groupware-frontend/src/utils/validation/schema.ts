import * as Yup from 'yup';

const requireMessage = '入力必須です';
const emailFormatMessage = 'メールアドレスの形式で入力してください';
const phoneFormatMessage = '電話番号の形式で入力してください';
const blankMixedMessage = '空白文字は使用できません';
const minEightTextMessage = '8文字以上で入力してください';
const minDateMessage = '開始日時は終了日時より前に設定してください';
const minTagsMessage = 'タグは一つ以上設定してください';
const minUsersMessage = 'チャットメンバーは一人以上設定してください';
const unmatchPasswordConfirmation = '再入力と新しいパスワードが一致しません';
const nWordLimitMessage = (len: number) => `${len}文字以内で入力してください`;
const afterNowMessage = '現在の日時以降に設定してください';
const kanaFormatMessage = 'カタカナのみで入力してください。';
// const minHostUsersMessage = '開催者/講師は一人以上設定してください';

export const loginSchema = Yup.object().shape({
  email: Yup.string().required(`メールアドレスは${requireMessage}`),
  password: Yup.string().required(`パスワードは${requireMessage}`),
});

export const wikiSchema = Yup.object().shape({
  title: Yup.string().required(requireMessage).max(100, nWordLimitMessage(100)),
  body: Yup.string().required(requireMessage),
});

export const updatePasswordSchema = Yup.object().shape({
  currentPassword: Yup.string().required(requireMessage),
  newPassword: Yup.string()
    .matches(/^([^ ]*)$/, blankMixedMessage)
    .min(8, minEightTextMessage)
    .required(requireMessage),
  newPasswordConfirmation: Yup.string()
    .required(requireMessage)
    .oneOf([Yup.ref('newPassword'), null], unmatchPasswordConfirmation),
});

export const registerSchema = Yup.object().shape({
  lastName: Yup.string()
    .required(`姓は${requireMessage}`)
    .max(50, `姓は${nWordLimitMessage(50)}`),
  firstName: Yup.string()
    .required(`名は${requireMessage}`)
    .max(50, `名は${nWordLimitMessage(50)}`),
  lastNameKana: Yup.string()
    .required(`姓(フリガナ)は${requireMessage}`)
    .matches(/^[ァ-ヶー]+$/, `姓(フリガナ)は${kanaFormatMessage}`)
    .max(50, `姓(フリガナ)は${nWordLimitMessage(50)}`),
  firstNameKana: Yup.string()
    .required(`名(フリガナ)は${requireMessage}`)
    .matches(/^[ァ-ヶー]+$/, `名(フリガナ)は${kanaFormatMessage}`)
    .max(50, `名(フリガナ)は${nWordLimitMessage(50)}`),
  email: Yup.string()
    .matches(
      /^([\w!#$%&'*+\-\/=?^`{|}~]+(\.[\w!#$%&'*+\-\/=?^`{|}~]+)*|"([\w!#$%&'*+\-\/=?^`{|}~. ()<>\[\]:;@,]|\\[\\"])+")@(([a-zA-Z\d\-]+\.)+[a-zA-Z]+|\[(\d{1,3}(\.\d{1,3}){3}|IPv6:[\da-fA-F]{0,4}(:[\da-fA-F]{0,4}){1,5}(:\d{1,3}(\.\d{1,3}){3}|(:[\da-fA-F]{0,4}){0,2}))\])$/,
      emailFormatMessage,
    )
    .required(`メールアドレス${requireMessage}`),
  phone: Yup.string().matches(
    /^0\d{2,3}-\d{1,4}-\d{1,4}$/,
    `電話番号は${phoneFormatMessage}`,
  ),
  password: Yup.string()
    .matches(/^([^ ]*)$/, blankMixedMessage)
    .min(8, minEightTextMessage)
    .required(`パスワードは${requireMessage}`),
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

export const createEventSchema = Yup.object().shape({
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

export const profileSchema = Yup.object().shape({
  email: Yup.string()
    .matches(
      /^([\w!#$%&'*+\-\/=?^`{|}~]+(\.[\w!#$%&'*+\-\/=?^`{|}~]+)*|"([\w!#$%&'*+\-\/=?^`{|}~. ()<>\[\]:;@,]|\\[\\"])+")@(([a-zA-Z\d\-]+\.)+[a-zA-Z]+|\[(\d{1,3}(\.\d{1,3}){3}|IPv6:[\da-fA-F]{0,4}(:[\da-fA-F]{0,4}){1,5}(:\d{1,3}(\.\d{1,3}){3}|(:[\da-fA-F]{0,4}){0,2}))\])$/,
      emailFormatMessage,
    )
    .required(requireMessage),
  phone: Yup.string().matches(
    /^0\d{2,3}-\d{1,4}-\d{1,4}$/,
    `電話番号は${phoneFormatMessage}`,
  ),
  lastName: Yup.string()
    .required(`姓は${requireMessage}`)
    .max(50, `姓は${nWordLimitMessage(50)}`),
  firstName: Yup.string()
    .required(`名は${requireMessage}`)
    .max(50, `名は${nWordLimitMessage(50)}`),
  lastNameKana: Yup.string()
    .required(`姓(フリガナ)は${requireMessage}`)
    .matches(/^[ァ-ヶー]+$/, `姓(フリガナ)は${kanaFormatMessage}`)
    .max(50, `姓(フリガナ)は${nWordLimitMessage(50)}`),
  firstNameKana: Yup.string()
    .required(`名(フリガナ)は${requireMessage}`)
    .matches(/^[ァ-ヶー]+$/, `名(フリガナ)は${kanaFormatMessage}`)
    .max(50, `名(フリガナ)は${nWordLimitMessage(50)}`),
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

export const albumSchema = Yup.object().shape({
  title: Yup.string().required('タイトルを設定してください'),
  images: Yup.array().min(1, '画像を一つ以上選択してください'),
});

export const noteSchema = Yup.object().shape({
  content: Yup.string().required(requireMessage),
});

export const editEventIntroductionSchema = Yup.object().shape({
  title: Yup.string()
    .required(`タイトルは${requireMessage}`)
    .max(100, `タイトルは${nWordLimitMessage(100)}`),
  description: Yup.string().required(`説明文は${requireMessage}`),
});

export const chatGroupSchema = Yup.object().shape({
  name: Yup.string().max(50, `ルーム名は${nWordLimitMessage(50)}`),
  members: Yup.array().min(1, minUsersMessage),
});

export const topNewsSchema = Yup.object().shape({
  urlPath: Yup.string().required(requireMessage),
  title: Yup.string()
    .required(requireMessage)
    .max(100, `タイトルは${nWordLimitMessage(100)}`),
});

export const travelCostFormModalSchema = Yup.object().shape({
  destination: Yup.string().required(requireMessage),
  purpose: Yup.string().required(requireMessage),
  departureStation: Yup.string().required(requireMessage),
  destinationStation: Yup.string().required(requireMessage),
  travelCost: Yup.number().required(requireMessage),
});

export const applicationFormModalSchema = Yup.object().shape({
  attendanceTime: Yup.date().required(requireMessage),
  destination: Yup.string().required(requireMessage),
  purpose: Yup.string().required(requireMessage),
  departureStation: Yup.string().required(requireMessage),
  destinationStation: Yup.string().required(requireMessage),
  travelCost: Yup.number().required(requireMessage),
});

export const attendanceSchema = Yup.object().shape({
  attendanceTime: Yup.date().required('出勤時間は' + requireMessage),
  absenceTime: Yup.date().required('退勤時間は' + requireMessage),
});
