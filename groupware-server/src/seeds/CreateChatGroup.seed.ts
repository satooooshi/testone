import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { ChatGroup } from 'src/entities/chatGroup.entity';

export default class CreateChatGroup implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    let user = await connection.getRepository(User).find();
    // const yachi = user[1];
    const shuffle = ([...array]) => {
      for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    if (user.length >= 3) {
      // user = shuffle(user.filter((u) => u.lastName !== 'やち'));
      // user.unshift(yachi);
      // for (let i = 0; i < 20; i++) {
      //   user = shuffle(user);
      //   await factory(ChatGroup)().createMany(1, {
      //     members: user.slice(0, 2),
      //   });
      //   await factory(ChatGroup)().createMany(1, {
      //     members: user.slice(20, 22),
      //   });
      //   await factory(ChatGroup)().createMany(1, {
      //     members: user.slice(40, 44),
      //   });
      //   await factory(ChatGroup)().createMany(1, {
      //     members: user.slice(58, 60),
      //   });
      //   await factory(ChatGroup)().createMany(1, {
      //     members: user.slice(60, 62),
      //   });
      //   await factory(ChatGroup)().createMany(1, {
      //     members: user.slice(70, 72),
      //   });
      // }
      for (let i = 0; i < 20; i++) {
        user = shuffle(user);
        await factory(ChatGroup)().createMany(10, {
          members: user.slice(0, 20),
        });
        await factory(ChatGroup)().createMany(10, {
          members: user.slice(20, 40),
        });
        await factory(ChatGroup)().createMany(10, {
          members: user.slice(40, 60),
        });
        await factory(ChatGroup)().createMany(10, {
          members: user.slice(100, 120),
        });
        await factory(ChatGroup)().createMany(10, {
          members: user.slice(60, 80),
        });
        await factory(ChatGroup)().createMany(10, {
          members: user.slice(80, 100),
        });
      }
      for (let i = 0; i < 10; i++) {
        await factory(ChatGroup)().createMany(1, {
          members: user.slice(70, 170),
        });
        await factory(ChatGroup)().createMany(1, {
          members: user.slice(170, 370),
        });
      }
      await factory(ChatGroup)().createMany(1, {
        members: user.slice(0, 200),
      });
      await factory(ChatGroup)().createMany(1, {
        members: user.slice(1, 500),
      });
    } else {
      console.error(
        ' This seeder will not run because the users do not have enough data.',
      );
    }
  }
}
