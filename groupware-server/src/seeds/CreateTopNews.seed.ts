import { EventSchedule } from 'src/entities/event.entity';
import { TopNews } from 'src/entities/topNews.entity';
import { User } from 'src/entities/user.entity';
import { Wiki } from 'src/entities/wiki.entity';
import { userNameFactory } from 'src/utils/factory/userNameFactory';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

export default class CreateNews implements Seeder {
  public async run(_: Factory, connection: Connection): Promise<void> {
    const existEvents = await connection
      .getRepository(EventSchedule)
      .find({ take: 4 });
    const existWiki = await connection.getRepository(Wiki).find({ take: 4 });
    const existAccount = await connection.getRepository(User).find({ take: 4 });
    const news: Partial<TopNews>[] = [];

    for (const e of existEvents) {
      news.push({ title: e.title, urlPath: `/event/${e.id.toString()}` });
    }
    for (const u of existWiki) {
      news.push({ title: u.title, urlPath: `/wiki/${u.id.toString()}` });
    }
    for (const u of existAccount) {
      news.push({
        title: userNameFactory(u),
        urlPath: `/account/${u.id.toString()}`,
      });
    }
    const shuffle = ([...array]) => {
      for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    };

    if (news.length) {
      await connection.getRepository(TopNews).save(shuffle(news));
    }
  }
}
