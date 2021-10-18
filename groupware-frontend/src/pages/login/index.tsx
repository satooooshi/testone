import React from 'react';
import Image from 'next/image';
import boldLogo from '@/public/bold-logo.png';
import loginLayoutStyles from '@/styles/layouts/Login.module.scss';
import { Formik } from 'formik';
import { useAPILogin } from '@/hooks/api/auth/useAPILogin';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { useRouter } from 'next/router';
import { axiosInstance } from 'src/utils/url';
import Head from 'next/head';
import Link from 'next/link';
import textInputStyles from '@/styles/components/TextInput.module.scss';
import textLinkStyles from '@/styles/components/TextLink.module.scss';
import clsx from 'clsx';
import authFormStyles from '@/styles/components/AuthForm.module.scss';
import AuthButton from '@/components/common/AuthButton';
import { Input } from '@chakra-ui/react';

const Login: React.FC = () => {
  const router = useRouter();
  const { authenticate, setUser } = useAuthenticate();
  const { mutate: mutateLogin } = useAPILogin({
    onSuccess: async (data) => {
      // const setLocalStorage = async () => {
      //   localStorage.setItem('userToken', data.token || '');
      //   await Promise.resolve();
      // };
      setUser(data);
      axiosInstance.defaults.headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${data.token || ''}`,
      };
      const asyncLocalStorage = {
        setItem: async function (key: string, value: string) {
          return Promise.resolve().then(function () {
            localStorage.setItem(key, value);
          });
        },
        getItem: async function (key: string): Promise<string> {
          return Promise.resolve().then(function () {
            return localStorage.getItem(key) || '';
          });
        },
      };

      // await setLocalStorage();
      asyncLocalStorage
        .setItem('userToken', data.token || '')
        .then(function (): Promise<string> {
          return asyncLocalStorage.getItem('userToken');
        })
        .then(function (value) {
          if (value) {
            router.push('/');
          }
        });
      authenticate();
    },
    onError: () => {
      alert('認証に失敗しました。入力内容をご確認ください');
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
        initialValues={{ email: '', password: '' }}
        onSubmit={(values) => mutateLogin(values)}>
        {({ values, handleChange, handleSubmit, errors }) => (
          <div className={authFormStyles.login_form}>
            <h1
              className={clsx(
                authFormStyles.auth_title,
                authFormStyles.form_margin,
              )}>
              Login to Service
            </h1>
            <p className={authFormStyles.form_margin}>
              アカウントをお持ちでない方は
              <Link href="/register">
                <a className={textLinkStyles.link}>こちら</a>
              </Link>
            </p>

            <p className={authFormStyles.validation_error_text}>
              {errors.email}
            </p>

            <button />
            <Input
              type="email"
              name="email"
              placeholder="email@com.com"
              value={values.email}
              onChange={handleChange}
              background="white"
              className={clsx(
                textInputStyles.input,
                authFormStyles.form_margin,
              )}
            />

            <p className={authFormStyles.validation_error_text}>
              {errors.password}
            </p>
            <Input
              type="password"
              name="password"
              placeholder="password"
              value={values.password}
              onChange={handleChange}
              background="white"
              className={clsx(
                textInputStyles.input,
                authFormStyles.form_margin,
              )}
            />
            <AuthButton
              name="Login"
              isActive={true}
              onClick={() => handleSubmit()}
            />
          </div>
        )}
      </Formik>
    </div>
  );
};

export default Login;
