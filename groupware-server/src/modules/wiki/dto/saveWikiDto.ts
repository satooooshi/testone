import { isNotEmptyExceptTags } from 'src/utils/dto/isNotEmptyExceptTags';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { WikiType } from 'src/entities/wiki.entity';
import { User } from 'src/entities/user.entity';

export class SaveWikiDto {
  id: number;
  writer?: User;
  @isNotEmptyExceptTags({
    message: 'タイトルは必須項目です。空白のみは設定できません。',
  })
  @IsString({ message: 'タイトルのリクエストは文字列型に限られています。' })
  title: string;

  @IsNotEmpty({ message: 'タイプは必須項目です。' })
  @IsEnum(WikiType, { message: 'タイプのリクエストは列挙型に限られています。' })
  type: WikiType;

  @IsOptional()
  @IsArray({ message: 'タグのリクエストは配列型に限られています。' })
  tags: [];

  @isNotEmptyExceptTags({
    message: '本文は必須項目です。空白のみは設定できません。',
  })
  @IsString({
    message: '質問内容のリクエストは文字列型に限られています。',
  })
  body: string;
}
export default SaveWikiDto;
