import React from 'react';
import Image from 'next/image';
import boldLogo from '@/public/bold-logo.png';
import registerStyles from '@/styles/layouts/Auth.module.scss';
import { Formik } from 'formik';
import { useAPIRegister } from '@/hooks/api/auth/useAPIRegister';
import authFormStyles from '@/styles/components/AuthForm.module.scss';
import textInputStyles from '@/styles/components/TextInput.module.scss';
import textLinkStyles from '@/styles/components/TextLink.module.scss';
import AuthButton from '@/components/AuthButton';
import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { registerSchema } from '../../utils/validation/schema';
import Head from 'next/head';
import { Input } from '@chakra-ui/react';

const Register: React.FC = () => {
  const router = useRouter();
  const { mutate: register } = useAPIRegister({
    onSuccess: () => {
      router.push('/login');
    },
  });

  return (
    <div className={registerStyles.screen_wrapper}>
      <Head>
        <title>新規登録</title>
      </Head>
      <Image
        className={registerStyles.logo_image}
        src={boldLogo}
        alt="bold logo"
      />
      <Formik
        initialValues={{ email: '', lastName: '', firstName: '', password: '' }}
        validateOnBlur={false}
        validateOnChange={false}
        onSubmit={(values) => register(values)}
        validationSchema={registerSchema}>
        {({ values, handleChange, handleSubmit, errors }) => (
          <div className={authFormStyles.login_form}>
            <h1
              className={clsx(
                authFormStyles.auth_title,
                authFormStyles.form_margin,
              )}>
              Register to Service
            </h1>
            <p className={authFormStyles.form_margin}>
              アカウントをお持ちの方は
              <Link href="/login">
                <a className={textLinkStyles.link}>こちら</a>
              </Link>
            </p>
            {errors.email && (
              <p className={registerStyles.validation_error_text}>
                {errors.email}
              </p>
            )}
            <Input
              type="email"
              name="email"
              placeholder="email@gmail.com"
              value={values.email}
              onChange={handleChange}
              background="white"
              className={clsx(
                textInputStyles.input,
                authFormStyles.form_margin,
              )}
            />

            {errors.lastName && (
              <p className={registerStyles.validation_error_text}>
                {errors.lastName}
              </p>
            )}
            <Input
              type="text"
              name="lastName"
              placeholder="姓"
              value={values.lastName}
              onChange={handleChange}
              background="white"
              className={clsx(
                textInputStyles.input,
                authFormStyles.form_margin,
              )}
            />
            {errors.firstName && (
              <p className={registerStyles.validation_error_text}>
                {errors.firstName}
              </p>
            )}
            <Input
              type="text"
              name="firstName"
              placeholder="名前"
              value={values.firstName}
              onChange={handleChange}
              background="white"
              className={clsx(
                textInputStyles.input,
                authFormStyles.form_margin,
              )}
            />
            {errors.password && (
              <p className={registerStyles.validation_error_text}>
                {errors.password}
              </p>
            )}
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
              name="Register"
              isActive={true}
              onClick={() => handleSubmit()}
            />
          </div>
        )}
      </Formik>
    </div>
  );
};

export default Register;
