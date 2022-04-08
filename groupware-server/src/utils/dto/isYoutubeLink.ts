import { ValidateBy, ValidationOptions } from 'class-validator';
import { EventVideo } from 'src/entities/eventVideo.entity';

export function isYoutubeLink(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: 'isYoutubeLink',
      validator: {
        validate(value: Partial<EventVideo>[]): boolean {
          const youtubeRegex =
            /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
          return value.some((v) => youtubeRegex.test(v.url));
        },
      },
    },
    validationOptions,
  );
}
