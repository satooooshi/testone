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
import { isNotEmptyExceptTags } from 'src/utils/dto/isNotEmptyExceptTags';
import { isYoutubeLink } from 'src/utils/dto/isYoutubeLink';
import { ChatGroup } from 'src/entities/chatGroup.entity';
import { EventSchedule, EventType } from 'src/entities/event.entity';
import { EventFile } from 'src/entities/eventFile.entity';
import { EventVideo } from 'src/entities/eventVideo.entity';
import { SubmissionFile } from 'src/entities/submissionFiles.entity';
import { Tag } from 'src/entities/tag.entity';
import { User } from 'src/entities/user.entity';
import { UserJoiningEvent } from 'src/entities/userJoiningEvent.entity';

export class saveEventDto implements Partial<EventSchedule> {
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
  tags: Tag[];

  @IsNotEmpty({ message: 'タイプは必須項目です。' })
  @IsEnum(EventType, {
    message: 'タイプのリクエストの値が不正です。',
  })
  type: EventType;

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
  @isYoutubeLink({ message: 'Youtubeの動画URLが不正です。' })
  videos: EventVideo[];

  id: number;
  imageURL: string;
  chatGroup?: ChatGroup;
  hostUsers?: User[];
  userJoiningEvent?: UserJoiningEvent[];
  author?: User;
  files: EventFile[];
  submissionFiles?: SubmissionFile[];
}
export default saveEventDto;
