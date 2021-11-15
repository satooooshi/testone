import { IsNotEmptyExceptTags } from 'src/utils/dto/IsNotEmptyExceptTags';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { WikiType } from 'src/entities/wiki.entity';

export class saveWikiDto {
  @IsNotEmptyExceptTags({
    message: 'タイトルは必須項目です。空白のみは設定できません。',
  })
  @IsString({ message: 'タイトルのリクエストは文字列型に限られています。' })
  title: string;

  @IsNotEmpty({ message: 'タイプは必須項目です。' })
  @IsEnum(WikiType, { message: 'タイプのリクエストは列挙型に限られています。' })
  type: string;

  @IsOptional()
  @IsArray({ message: 'タグのリクエストは配列型に限られています。' })
  tags: [];

  @IsNotEmptyExceptTags({
    message: '質問内容は必須項目です。空白のみは設定できません。',
  })
  @IsString({
    message: '質問内容のリクエストは文字列型に限られています。',
  })
  body: string;
}
export default saveWikiDto;
