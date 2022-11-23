import { Tag } from 'src/entities/tag.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

export default class CreateTags implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const isExistTags = !(await connection.getRepository(Tag).findOne());
    if (isExistTags) {
      await factory(Tag)().createMany(20);
    } else {
      console.error(
        ' This seeder will not run because the data already exists',
      );
    }
  }
}
