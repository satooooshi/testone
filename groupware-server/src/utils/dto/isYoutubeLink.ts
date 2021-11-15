import { ValidateBy, ValidationOptions } from 'class-validator';

export function IsYoutubeLink(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'IsYoutubeLink',
      validator: {
        validate(value): boolean {
          const youtubeRegex =
            /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
          return youtubeRegex.test(value);
        },
      },
    },
    validationOptions,
  );
}
