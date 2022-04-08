import { IsString } from 'class-validator';
import { EventSchedule } from 'src/entities/event.entity';
import { User } from 'src/entities/user.entity';
import { isNotEmptyExceptTags } from 'src/utils/dto/isNotEmptyExceptTags';

export class CreateCommentDto {
  @isNotEmptyExceptTags({
    message: '空白のみのコメントは送信できません。',
  })
  @IsString()
  body: string;

  id: number;
  eventSchedule?: EventSchedule;
  writer?: User;
  createdAt: Date;
  updatedAt: Date;
}
export default CreateCommentDto;
