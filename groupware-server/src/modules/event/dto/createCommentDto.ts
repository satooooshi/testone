import { IsString } from 'class-validator';
import { isNotEmptyExceptTags } from 'src/utils/dto/isNotEmptyExceptTags';

export class createCommentDto {
  @isNotEmptyExceptTags({
    message: '空白のみのコメントは送信できません。',
  })
  @IsString()
  body: string;
}
export default createCommentDto;
