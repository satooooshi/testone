import styles from '@/styles/components/LoginButton.module.scss';
import { HTMLProps } from 'react';
import clsx from 'clsx';

type AuthButtonProps = HTMLProps<HTMLButtonElement> & {
  name: string;
  isActive: boolean;
};

const AuthButton: React.FC<AuthButtonProps> = ({ name, isActive, onClick }) => {
  return (
    <button
      type="submit"
      onClick={onClick}
      disabled={!isActive}
      className={clsx(
        styles.button_oblong,
        isActive
          ? styles.button_oblong__active
          : styles.button_oblong__disabled,
      )}>
      {name}
    </button>
  );
};
export default AuthButton;
