import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';
import { User } from 'src/entities/user.entity';
import { isNotEmptyExceptTags } from 'src/utils/dto/isNotEmptyExceptTags';

export class SaveChatGroupDto {
  @isNotEmptyExceptTags({
    message: 'タイトルは必須項目です。空白のみは設定できません。',
  })
  @IsString()
  name: string;

  @ArrayNotEmpty({ message: 'メンバーは最低一人以上選択してください。' })
  @IsArray({ message: 'メンバーのリクエストは配列型に限られています。' })
  members?: User[];
}
export default SaveChatGroupDto;
