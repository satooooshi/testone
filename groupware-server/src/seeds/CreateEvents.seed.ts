import { EventSchedule } from 'src/entities/event.entity';
import { User } from 'src/entities/user.entity';
import { UserJoiningEvent } from 'src/entities/userJoiningEvent.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

export default class CreateEvents implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const user = await connection.getRepository(User).find();

    const event = await factory(EventSchedule)().create({
      title: 'test by seed',
    });
    for (let i = 0; i < 20; i++) {
      const userJoiningEvent: UserJoiningEvent = {
        user: user[i],
        event: event,
      };
      await connection.getRepository(UserJoiningEvent).save(userJoiningEvent);
    }
  }
}
