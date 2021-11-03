import { ValidateBy, ValidationOptions } from 'class-validator';

export function isNotEmptyExceptTags(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isNotEmptyExceptTags',
      validator: {
        validate(value): boolean {
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
