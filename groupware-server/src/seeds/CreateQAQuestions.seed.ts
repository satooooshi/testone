import { Wiki } from 'src/entities/wiki.entity';
import { Factory, Seeder } from 'typeorm-seeding';

export default class CreateQAQuestions implements Seeder {
  public async run(factory: Factory): Promise<void> {
    await factory(Wiki)().createMany(20);
  }
}
