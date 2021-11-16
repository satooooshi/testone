import { IsString } from 'class-validator';
import { EventSchedule } from 'src/entities/event.entity';
import { EventComment } from 'src/entities/eventComment.entity';
import { User } from 'src/entities/user.entity';
import { IsNotEmptyExceptTags } from 'src/utils/dto/IsNotEmptyExceptTags';

export class createCommentDto implements EventComment {
  @IsNotEmptyExceptTags({
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
