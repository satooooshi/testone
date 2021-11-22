import React from 'react';
import Image from 'next/image';
import boldLogo from '@/public/bold-logo.png';
import loginLayoutStyles from '@/styles/layouts/Login.module.scss';
import { useFormik } from 'formik';
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
import { Input, useToast } from '@chakra-ui/react';
import { loginSchema } from 'src/utils/validation/schema';
import { formikErrorMsgFactory } from 'src/utils/factory/formikErrorMsgFactory';
import { responseErrorMsgFactory } from 'src/utils/factory/responseErrorMsgFactory';

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
      toast({
        title: 'ログインしました',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    },
    onError: (e) => {
      // FIXME: API側のエラーメッセージを追加する必要があるかもしれません。
      // const messages = responseErrorMsgFactory(e);
      const messages = '認証に失敗しました。入力内容をご確認ください';
      toast({
        description: messages,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    },
  });

  const toast = useToast();

  const { values, handleChange, handleSubmit, validateForm } = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: loginSchema,
    onSubmit: (values) => mutateLogin(values),
  });

  const checkErrors = async (e) => {
    e.preventDefault();
    const errors = await validateForm();
    const messages = formikErrorMsgFactory(errors);
    if (messages) {
      toast({
        description: messages,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      handleSubmit();
    }
  };

  return (
    <div className={loginLayoutStyles.screen_wrapper}>
      <Head>
        <title>ログイン</title>
      </Head>
      <div className={loginLayoutStyles.logo_image}>
        <Image src={boldLogo} alt="bold logo" />
      </div>
      <form
        className={authFormStyles.login_form}
        onSubmit={checkErrors}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Enter') {
            checkErrors(e);
          }
        }}>
        <h1
          className={clsx(
            authFormStyles.auth_title,
            authFormStyles.form_margin,
          )}>
          Login to Service
        </h1>
        <p className={authFormStyles.form_margin}>
          パスワードをお忘れの方は
          <Link href="/forgot-password" passHref>
            <a className={textLinkStyles.link}>こちら</a>
          </Link>
        </p>
        <Input
          type="email"
          name="email"
          placeholder="email@com.com"
          value={values.email}
          onChange={handleChange}
          background="white"
          className={clsx(textInputStyles.input, authFormStyles.form_margin)}
        />
        <Input
          type="password"
          name="password"
          placeholder="password"
          value={values.password}
          onChange={handleChange}
          background="white"
          className={clsx(textInputStyles.input, authFormStyles.form_margin)}
        />
        <AuthButton name="Login" isActive={true} />
      </form>
    </div>
  );
};

export default Login;
