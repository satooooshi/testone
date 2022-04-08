import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { ChatGroup } from 'src/entities/chatGroup.entity';

export default class CreateChatGroup implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const user = await connection.getRepository(User).find();

    if (user.length >= 3) {
      await factory(ChatGroup)().createMany(5, {
        members: [user[0], user[1], user[2]],
      });
    } else {
      console.error(
        ' This seeder will not run because the users do not have enough data.',
      );
    }
  }
}
