import React from 'react';
import Image from 'next/image';
import boldLogo from '@/public/bold-logo.png';
import loginLayoutStyles from '@/styles/layouts/Login.module.scss';
import { Formik } from 'formik';
import Head from 'next/head';
import Link from 'next/link';
import textInputStyles from '@/styles/components/TextInput.module.scss';
import textLinkStyles from '@/styles/components/TextLink.module.scss';
import clsx from 'clsx';
import authFormStyles from '@/styles/components/AuthForm.module.scss';
import AuthButton from '@/components/common/AuthButton';
import { Input, useToast } from '@chakra-ui/react';
import { useAPIRefreshPassword } from '@/hooks/api/auth/useAPIRefreshPassword';

const ForgotPassword: React.FC = () => {
  const toast = useToast();
  const { mutate: refreshPassword } = useAPIRefreshPassword({
    onSuccess: () => {
      toast({
        description: 'パスワード再発行メールを送信しました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  return (
    <div className={loginLayoutStyles.screen_wrapper}>
      <Head>
        <title>ログイン</title>
      </Head>
      <div className={loginLayoutStyles.logo_image}>
        <Image src={boldLogo} alt="bold logo" />
      </div>
      <Formik
        initialValues={{ email: '' }}
        onSubmit={(values) => refreshPassword(values)}>
        {({ values, handleChange, handleSubmit, errors }) => (
          <div className={authFormStyles.login_form}>
            <p className={clsx(authFormStyles.form_margin)}>
              {
                'ご登録されているメールアドレス宛に\nパスワードを再発行メールを送信します'
              }
            </p>
            <p className={authFormStyles.form_margin}>
              <Link href="/forgot-password">
                <a className={textLinkStyles.link}>ログイン画面へ</a>
              </Link>
            </p>

            <p className={authFormStyles.validation_error_text}>
              {errors.email}
            </p>

            <button />
            <Input
              type="email"
              name="email"
              placeholder="メールアドレスを入力してください"
              value={values.email}
              onChange={handleChange}
              background="white"
              className={clsx(
                textInputStyles.input,
                authFormStyles.form_margin,
              )}
            />

            <AuthButton
              name="再発行メールを送信"
              isActive={true}
              onClick={() => handleSubmit()}
            />
          </div>
        )}
      </Formik>
    </div>
  );
};

export default ForgotPassword;
