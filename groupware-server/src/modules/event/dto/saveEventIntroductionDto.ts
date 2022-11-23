import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { EventType } from 'src/entities/event.entity';
import { isNotEmptyExceptTags } from 'src/utils/dto/isNotEmptyExceptTags';

export class SaveEventIntroductionDto {
  @isNotEmptyExceptTags({
    message: 'タイトルは必須項目です。空白のみは設定できません。',
  })
  @IsString()
  title: string;

  @ValidateIf((_, v) => v != null && v.length)
  @isNotEmptyExceptTags({ message: '空白のみの説明文は設定できません。' })
  description: string;

  @IsNotEmpty({ message: 'タイプは必須項目です' })
  @IsEnum(EventType, {
    message: '不正なリクエストが送信されました',
  })
  type: EventType;
}
export default SaveEventIntroductionDto;
