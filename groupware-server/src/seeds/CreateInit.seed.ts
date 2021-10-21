import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { User, UserRole } from 'src/entities/user.entity';
import { ChatGroup } from 'src/entities/chatGroup.entity';
import { Tag } from 'src/entities/tag.entity';
import { EventSchedule } from 'src/entities/event.entity';
import { Wiki } from 'src/entities/wiki.entity';
import { hashSync } from 'bcrypt';

export default class CreateInit implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    const isExistInitUser = !(await connection
      .getRepository(User)
      .findOne({ email: 'valleyin@example.com' }));
    const isExistTags = !(await connection.getRepository(Tag).findOne());
    if (isExistInitUser && isExistTags) {
      // user
      await connection
        .createQueryBuilder()
        .insert()
        .into(User)
        .values([
          {
            email: 'valleyin@example.com',
            lastName: '谷内',
            firstName: '健悟',
            password: hashSync('password', 10),
            role: UserRole.COMMON,
            avatarUrl:
              'https://eowesttokyo.org/wp-content/uploads/2019/03/valleyin.jpg',
            verifiedAt: new Date(),
          },
          {
            email: 'test@example.com',
            lastName: 'やち',
            firstName: 'けんご',
            password: hashSync('password', 10),
            role: UserRole.ADMIN,
            avatarUrl:
              'https://eowesttokyo.org/wp-content/uploads/2019/03/valleyin.jpg',
            verifiedAt: new Date(),
          },
          {
            email: 'takeda@example.com',
            lastName: 'たけだ',
            firstName: 'けんた',
            password: hashSync('password', 10),
            role: UserRole.EXTERNAL_INSTRUCTOR,
            avatarUrl:
              'https://eowesttokyo.org/wp-content/uploads/2019/03/valleyin.jpg',
            verifiedAt: new Date(),
          },
        ])
        .execute();

      // chatGroup
      const user = await connection.getRepository(User).find();
      await factory(ChatGroup)().createMany(5, {
        members: [user[0], user[1], user[2]],
      });

      // QAQuestion
      await factory(Wiki)().createMany(20);

      // Tags
      await factory(Tag)().createMany(20);

      // Event
      await factory(EventSchedule)().createMany(20);
    } else {
      console.error(
        ' This seeder will not run because the data already exists',
      );
    }
  }
}
