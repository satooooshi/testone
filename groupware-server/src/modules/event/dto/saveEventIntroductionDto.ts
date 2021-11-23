import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { EventType } from 'src/entities/event.entity';
import { isNotEmptyExceptTags } from 'src/utils/dto/isNotEmptyExceptTags';

export class SaveEventIntroductionDto {
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
}
export default SaveEventIntroductionDto;
