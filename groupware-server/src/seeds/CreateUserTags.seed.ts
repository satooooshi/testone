import { UserTag } from 'src/entities/userTag.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

export default class createUserTag implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const isExistUserTags = !(await connection.getRepository(UserTag).findOne());
    if (isExistUserTags) {
        await factory(UserTag)().createMany(20);
    } else {
      console.error(
        ' This seeder will not run because the data already exists',
      );
    }
  }
}
