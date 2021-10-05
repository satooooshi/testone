import React, { ChangeEvent } from 'react';
import inputWithUserPropertyStyles from '@/styles/components/InputWithUserProperty.module.scss';

type InputWithUserPropertyProps = {
  inputValue: string;
  onChangeInputValue?: (e: ChangeEvent<HTMLInputElement>) => void;
  onChageTextareaValue?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  name: string;
  isTextArea?: boolean;
};

const InputWithUserProperty: React.FC<InputWithUserPropertyProps> = ({
  inputValue,
  onChangeInputValue,
  onChageTextareaValue,
  name,
  isTextArea,
}) => {
  return (
    <div className={inputWithUserPropertyStyles.row}>
      <div className={inputWithUserPropertyStyles.label_text_wrapper}>
        <p className={inputWithUserPropertyStyles.label_text}>{name}</p>
      </div>
      {isTextArea ? (
        <div className={inputWithUserPropertyStyles.textarea_wrapper}>
          <textarea
            className={inputWithUserPropertyStyles.textarea}
            onChange={onChageTextareaValue}
            value={inputValue}
          />
        </div>
      ) : (
        <input
          type="input"
          className={inputWithUserPropertyStyles.input}
          onChange={onChangeInputValue}
          value={inputValue}
        />
      )}
    </div>
  );
};

export default InputWithUserProperty;
