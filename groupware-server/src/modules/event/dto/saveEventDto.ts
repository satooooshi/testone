import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinDate,
  ValidateIf,
} from 'class-validator';
import { EventType } from 'src/entities/event.entity';
import { isNotEmptyExceptTags } from 'src/utils/dto/isNotEmptyExceptTags';
import { isYoutubeLink } from 'src/utils/dto/isYoutubeLink';

export class saveEventDto {
  @isNotEmptyExceptTags({
    message: 'タイトルは必須項目です。空白のみは設定できません。',
  })
  @IsString()
  title: string;

  @ValidateIf((o, v) => v != null && v.length)
  @isNotEmptyExceptTags({ message: '空白のみの概要は設定できません。' })
  description: string;

  @ArrayNotEmpty({ message: 'タグは必須項目です。' })
  @IsArray({ message: '不正なリクエストです。' })
  tags: [];

  @IsNotEmpty({ message: '不正なリクエストです。' })
  @IsEnum(EventType, { message: '不正なリクエストです。' })
  type: Date;

  @Type(() => Date)
  @IsNotEmpty({ message: '不正なリクエストです。' })
  @IsDate({ message: '不正なリクエストです。' })
  @MinDate(new Date(), { message: '不正なリクエストです。' })
  startAt: Date;

  @Type(() => Date)
  @IsNotEmpty({ message: '不正なリクエストです。' })
  @IsDate({ message: '不正なリクエストです。' })
  endAt: Date;

  @IsNotEmpty({ message: '不正なリクエストです。' })
  @IsBoolean({ message: '不正なリクエストです。' })
  chatNeeded: boolean;

  @ValidateIf((o, v) => v != null && v.length)
  @IsArray({ message: '不正なリクエストです。' })
  @isYoutubeLink({ message: 'Youtubeの動画URLが不正です。ご確認ください。' })
  videos: [];
}
export default saveEventDto;
