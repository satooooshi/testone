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
  @IsArray({ message: 'タグのリクエストは配列型に限られています。' })
  tags: [];

  @IsNotEmpty({ message: 'タイプは必須項目です。' })
  @IsEnum(EventType, {
    message: 'タイプのリクエストは列挙型に限られています。',
  })
  type: string;

  @Type(() => Date)
  @IsNotEmpty({ message: '開始日時は必須項目です。' })
  @IsDate({ message: '開始日時のリクエストは日付型に限られています。' })
  @MinDate(new Date(), {
    message: '開始日時は現在日時よりも後に設定してください。',
  })
  startAt: Date;

  @Type(() => Date)
  @IsNotEmpty({ message: '終了日時は必須項目です。' })
  @IsDate({ message: '終了日時のリクエストは日付型に限られています。' })
  endAt: Date;

  @IsNotEmpty({ message: 'チャットルームの作成有無は必須項目です。' })
  @IsBoolean({
    message: 'チャットルームの作成有無のリクエストは真偽値に限られています。',
  })
  chatNeeded: boolean;

  @ValidateIf((o, v) => v != null && v.length)
  @IsArray({ message: 'YouTubeリンクのリクエストは配列型に限られています。' })
  @isYoutubeLink({ message: 'Youtubeの動画URLが不正です。ご確認ください。' })
  videos: [];
}
export default saveEventDto;
