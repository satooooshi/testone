import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateIf,
} from 'class-validator';
import { isNotEmptyExceptTags } from 'src/utils/dto/isNotEmptyExceptTags';

export class saveEventDto {
  @IsNotEmpty({ message: 'タイトルは必須項目です。' })
  @isNotEmptyExceptTags({ message: '空白のみのタイトルは設定できません。' })
  @IsString()
  title: string;

  @ValidateIf((o, v) => v != null && v.length)
  @isNotEmptyExceptTags({ message: '空白のみの概要は設定できません。' })
  description: string;

  @ArrayNotEmpty({ message: 'タグは必須項目です。' })
  @IsArray()
  tags: [];
}
export default saveEventDto;
