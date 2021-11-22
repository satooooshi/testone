import { isNotEmptyExceptTags } from 'src/utils/dto/isNotEmptyExceptTags';
import { IsString } from 'class-validator';
import { User } from 'src/entities/user.entity';

export class CreateAnswerDto {
  @isNotEmptyExceptTags({
    message: '回答内容は必須項目です。空白のみは設定できません。',
  })
  @IsString({
    message: '回答内容のリクエストは文字列型に限られています。',
  })
  body: string;

  writer?: User;
}
export default CreateAnswerDto;
