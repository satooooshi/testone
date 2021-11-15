import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';
import { ChatGroup } from 'src/entities/chatGroup.entity';
import { ChatMessage } from 'src/entities/chatMessage.entity';
import { EventSchedule } from 'src/entities/event.entity';
import { LastReadChatTime } from 'src/entities/lastReadChatTime.entity';
import { User } from 'src/entities/user.entity';
import { IsNotEmptyExceptTags } from 'src/utils/dto/IsNotEmptyExceptTags';

export class saveChatGroupDto implements Partial<ChatGroup> {
  @IsNotEmptyExceptTags({
    message: 'タイトルは必須項目です。空白のみは設定できません。',
  })
  @IsString()
  name: string;

  @ArrayNotEmpty({ message: 'メンバーは最低一人以上選択してください。' })
  @IsArray({ message: 'メンバーのリクエストは配列型に限られています。' })
  members?: User[];

  id: number;
  imageURL: string;
  event?: EventSchedule;
  chatMessages?: ChatMessage[];
  lastReadChatTime?: LastReadChatTime[];
  createdAt: Date;
  updatedAt: Date;
}
export default saveChatGroupDto;
