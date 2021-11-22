import { EventType } from 'src/entities/event.entity';
import { EventIntroduction } from 'src/entities/eventIntroduction.entity';
import { EventIntroductionSubImage } from 'src/entities/eventIntroductionSubImage.entity';
import { Connection } from 'typeorm';
import { Factory, Seeder } from 'typeorm-seeding';

export default class CreateEventIntroductionSubImages implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<void> {
    await connection.getRepository(EventIntroductionSubImage).clear();
    const implessiveUniversityEventIntroduction = await connection
      .getRepository(EventIntroduction)
      .findOne({ type: EventType.IMPRESSIVE_UNIVERSITY });
    const studyMeetingEventIntroduction = await connection
      .getRepository(EventIntroduction)
      .findOne({ type: EventType.STUDY_MEETING });
    const boldayEventIntroduction = await connection
      .getRepository(EventIntroduction)
      .findOne({ type: EventType.BOLDAY });
    // const coachEventIntroduction = await connection
    //   .getRepository(EventIntroduction)
    //   .findOne({ type: EventType.COACH });
    const clubEventIntroduction = await connection
      .getRepository(EventIntroduction)
      .findOne({ type: EventType.CLUB });

    const implessiveUniversityEventIntroductionSubImage = await connection
      .getRepository(EventIntroductionSubImage)
      .findOne({ eventIntroduction: implessiveUniversityEventIntroduction });
    const studyMeetingEventIntroductionSubImage = await connection
      .getRepository(EventIntroductionSubImage)
      .findOne({ eventIntroduction: studyMeetingEventIntroduction });
    const boldayEventIntroductionSubImage = await connection
      .getRepository(EventIntroductionSubImage)
      .findOne({ eventIntroduction: boldayEventIntroduction });
    // const coachEventIntroductionSubImage = await connection
    //   .getRepository(EventIntroductionSubImage)
    //   .findOne({ eventIntroduction: coachEventIntroduction });
    const clubEventIntroductionSubImage = await connection
      .getRepository(EventIntroductionSubImage)
      .findOne({ eventIntroduction: clubEventIntroduction });

    if (
      implessiveUniversityEventIntroduction &&
      !implessiveUniversityEventIntroductionSubImage
    ) {
      await connection
        .createQueryBuilder()
        .insert()
        .into(EventIntroductionSubImage)
        .values([
          {
            imageUrl:
              'https://storage.googleapis.com/groupware-bucket-development/1637378765645/impressive_university_1.png',
            eventIntroduction: implessiveUniversityEventIntroduction,
          },
          {
            imageUrl:
              'https://storage.googleapis.com/groupware-bucket-development/1637378770502/impressive_university_2.png',
            eventIntroduction: implessiveUniversityEventIntroduction,
          },
        ])
        .execute();
    }
    if (
      studyMeetingEventIntroduction &&
      !studyMeetingEventIntroductionSubImage
    ) {
      // 初期値をインサート
      await connection
        .createQueryBuilder()
        .insert()
        .into(EventIntroductionSubImage)
        .values([
          {
            imageUrl:
              'https://storage.googleapis.com/groupware-bucket-development/1637378894978/study_meeting_1.jpg',
            eventIntroduction: studyMeetingEventIntroduction,
          },
          {
            imageUrl:
              'https://storage.googleapis.com/groupware-bucket-development/1637378899485/study_meeting_2.jpg',
            eventIntroduction: studyMeetingEventIntroduction,
          },
        ])
        .execute();
    }
    if (boldayEventIntroduction && !boldayEventIntroductionSubImage) {
      // 初期値をインサート
      await connection
        .createQueryBuilder()
        .insert()
        .into(EventIntroductionSubImage)
        .values([
          {
            imageUrl:
              'https://storage.googleapis.com/groupware-bucket-development/1637378512243/bolday_1.jpg',
            eventIntroduction: boldayEventIntroduction,
          },
          {
            imageUrl:
              'https://storage.googleapis.com/groupware-bucket-development/1637378521513/bolday_2.jpg',
            eventIntroduction: boldayEventIntroduction,
          },
          {
            imageUrl:
              'https://storage.googleapis.com/groupware-bucket-development/1637378525371/bolday_3.jpg',
            eventIntroduction: boldayEventIntroduction,
          },
          {
            imageUrl:
              'https://storage.googleapis.com/groupware-bucket-development/1637378530305/bolday_4.jpg',
            eventIntroduction: boldayEventIntroduction,
          },
        ])
        .execute();
    }
    // if (coachEventIntroduction && !coachEventIntroductionSubImage) {
    //   // 初期値をインサート
    //   await connection
    //     .createQueryBuilder()
    //     .insert()
    //     .into(EventIntroductionSubImage)
    //     .values([
    //       {
    //         imageUrl:
    //           '',
    //         eventIntroduction: coachEventIntroduction,
    //       },
    //       {
    //         imageUrl:
    //           '',
    //         eventIntroduction: coachEventIntroduction,
    //       },
    //       {
    //         imageUrl:
    //           '',
    //         eventIntroduction: coachEventIntroduction,
    //       },
    //       {
    //         imageUrl:
    //           '',
    //         eventIntroduction: coachEventIntroduction,
    //       },
    //     ])
    //     .execute();
    //     }
    if (clubEventIntroduction && !clubEventIntroductionSubImage) {
      // 初期値をインサート
      await connection
        .createQueryBuilder()
        .insert()
        .into(EventIntroductionSubImage)
        .values([
          {
            imageUrl:
              'https://storage.googleapis.com/groupware-bucket-development/1637377008205/club_3.png',
            eventIntroduction: clubEventIntroduction,
          },
          {
            imageUrl:
              'https://storage.googleapis.com/groupware-bucket-development/1637377012334/club_4.jpg',
            eventIntroduction: clubEventIntroduction,
          },
          {
            imageUrl:
              'https://storage.googleapis.com/groupware-bucket-development/1637377020446/club_6.jpg',
            eventIntroduction: clubEventIntroduction,
          },
          {
            imageUrl:
              'https://storage.googleapis.com/groupware-bucket-development/1637376999970/club_2.jpg',
            eventIntroduction: clubEventIntroduction,
          },
        ])
        .execute();
    }
  }
}
