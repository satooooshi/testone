import clsx from 'clsx';
import Link from 'next/link';
import AuthButton from '@/components/common/AuthButton';
import { ChangeEvent, useEffect, useState } from 'react';
import authFormStyles from '@/styles/components/AuthForm.module.scss';
import textInputStyles from '@/styles/components/TextInput.module.scss';
import textLinkStyles from '@/styles/components/TextLink.module.scss';
import { FormikErrors } from 'formik';

type AuthFormProps = {
  email: string;
  password: string;
  onChangeInput: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  errors: FormikErrors<{
    email: string;
    password: string;
  }>;
};

const AuthForm: React.FC<AuthFormProps> = ({
  email,
  password,
  onChangeInput,
  onSubmit,
  errors,
}) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (email && password) {
      setIsActive(true);
    }
  }, [email, password]);

  return (
    <div className={authFormStyles.login_form}>
      <h1
        className={clsx(authFormStyles.auth_title, authFormStyles.form_margin)}>
        Login to Service
      </h1>
      <span className={authFormStyles.form_margin}>
        アカウントをお持ちでない方は
        <Link href="/register">
          <a className={textLinkStyles.link}>こちら</a>
        </Link>
      </span>

      <p className={authFormStyles.validation_error_text}>{errors.email}</p>

      <button />
      <input
        type="email"
        name="email"
        placeholder="email@com.com"
        value={email}
        onChange={onChangeInput}
        className={clsx(textInputStyles.input, authFormStyles.form_margin)}
      />

      <p className={authFormStyles.validation_error_text}>{errors.password}</p>

      <input
        type="password"
        name="password"
        placeholder="password"
        value={password}
        onChange={onChangeInput}
        className={clsx(textInputStyles.input, authFormStyles.form_margin)}
      />
      <AuthButton name="Login" isActive={isActive} onClick={onSubmit} />
    </div>
  );
};

export default AuthForm;
