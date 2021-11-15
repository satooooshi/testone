import { IsString } from 'class-validator';
import { EventSchedule } from 'src/entities/event.entity';
import { EventComment } from 'src/entities/eventComment.entity';
import { User } from 'src/entities/user.entity';
import { isNotEmptyExceptTags } from 'src/utils/dto/isNotEmptyExceptTags';

export class createCommentDto implements EventComment {
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
export default createCommentDto;
