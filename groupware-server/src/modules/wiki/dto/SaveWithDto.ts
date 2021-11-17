import { IsNotEmptyExceptTags } from 'src/utils/dto/IsNotEmptyExceptTags';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Wiki, WikiType } from 'src/entities/wiki.entity';
import { User } from 'src/entities/user.entity';

export class SaveWikiDto implements Partial<Wiki> {
  id: number;
  writer?: User;

  @IsNotEmptyExceptTags({
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

  @IsNotEmptyExceptTags({
    message: '質問内容は必須項目です。空白のみは設定できません。',
  })
  @IsString({
    message: '質問内容のリクエストは文字列型に限られています。',
  })
  body: string;
}
export default SaveWikiDto;
