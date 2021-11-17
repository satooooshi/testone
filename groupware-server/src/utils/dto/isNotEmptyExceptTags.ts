import { ValidateBy, ValidationOptions } from 'class-validator';

//中身が空、null、false等、jsのfalse対象、又はスペースのみ、又はリッチテキストエディタ内スペースのみを弾くカスタムバリデーター
export function IsNotEmptyExceptTags(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'IsNotEmptyExceptTags',
      validator: {
        validate(value): boolean {
          if (!value) {
            return false;
          }
          const isExist = value
            .replace(/<("[^"]*"|'[^']*'|[^'">])*>|&nbsp;/g, '')
            .trim();
          return isExist;
        },
      },
    },
    validationOptions,
  );
}
