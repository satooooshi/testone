import { EventSchedule } from 'src/entities/event.entity';
import { Factory, Seeder } from 'typeorm-seeding';

export default class CreateEvents implements Seeder {
  public async run(factory: Factory): Promise<void> {
    await factory(EventSchedule)().createMany(20);
  }
}
