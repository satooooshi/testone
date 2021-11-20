import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';
import { EventType } from 'src/entities/event.entity';
import { EventIntroduction } from 'src/entities/eventIntroduction.entity';
import { isNotEmptyExceptTags } from 'src/utils/dto/isNotEmptyExceptTags';

export class SaveEventIntroductionDto implements EventIntroduction {
  @isNotEmptyExceptTags({
    message: 'タイトルは必須項目です。空白のみは設定できません。',
  })
  @IsString()
  title: string;

  @ValidateIf((o, v) => v != null && v.length)
  @isNotEmptyExceptTags({ message: '空白のみの説明文は設定できません。' })
  description: string;

  @IsNotEmpty({ message: 'タイプは必須項目です。' })
  @IsEnum(EventType, {
    message: 'タイプのリクエストの値が不正です。',
  })
  type: EventType;

  @IsNotEmpty({ message: 'メイン画像は必須項目です。' })
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString({
    message: 'サブ画像のリクエストの値が不正です。',
  })
  imageUrlSub1: string;

  @IsOptional()
  @IsString({
    message: 'サブ画像のリクエストの値が不正です。',
  })
  imageUrlSub2: string;

  @IsOptional()
  @IsString({
    message: 'サブ画像のリクエストの値が不正です。',
  })
  imageUrlSub3: string;

  @IsOptional()
  @IsString({
    message: 'サブ画像のリクエストの値が不正です。',
  })
  imageUrlSub4: string;

  id: number;
  createdAt: Date;
  updatedAt: Date;
}
export default SaveEventIntroductionDto;
