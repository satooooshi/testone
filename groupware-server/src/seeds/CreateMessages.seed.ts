import { ChatGroup } from 'src/entities/chatGroup.entity';
import { ChatMessage, ChatMessageType } from 'src/entities/chatMessage.entity';
import { Tag } from 'src/entities/tag.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

export default class CreateMessages implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    // const groupID = 0;
    const group = await connection.getRepository(ChatGroup).find();
    for (const g of group) {
      const existGroup = await connection
        .getRepository(ChatGroup)
        .findOne(g.id, { relations: ['members'] });

      for (const m of existGroup.members) {
        await connection.getRepository(ChatMessage).save({
          chatGroup: existGroup,
          sender: m,
          type: ChatMessageType.TEXT,
          content: `test ${m.lastName}`,
        });
      }
    }
  }
}
