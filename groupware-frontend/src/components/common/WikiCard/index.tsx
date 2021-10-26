import React, { useMemo } from 'react';
import qaCardStyles from '@/styles/components/QACard.module.scss';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { Wiki, WikiType } from 'src/types';
import Link from 'next/link';
import { Avatar, Button } from '@chakra-ui/react';
import boldMascot from '@/public/bold-mascot.png';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';

type WikiCardProps = {
  wiki: Wiki;
};

const WikiCard: React.FC<WikiCardProps> = ({ wiki }) => {
  const { title, writer, tags, createdAt, answers } = wiki;
  const tagButtonColor = useMemo(() => {
    switch (wiki.type) {
      case WikiType.QA:
        return 'cyan';
      case WikiType.KNOWLEDGE:
        return 'yellow';
      case WikiType.RULES:
        return 'green';
    }
  }, [wiki.type]);

  return (
    <Link href={`/wiki/detail/${wiki.id}`}>
      <a className={qaCardStyles.qa_card__item}>
        <div className={qaCardStyles.qa_card__top}>
          <div className={qaCardStyles.qa_card_user_info_wrapper}>
            {wiki.type !== WikiType.RULES ? (
              writer && writer.existence ? (
                <Link href={`/account/${writer.id}`} passHref>
                  <a>
                    <Avatar
                      src={writer.avatarUrl}
                      className={qaCardStyles.qa_card__avatar}
                    />
                  </a>
                </Link>
              ) : (
                <Avatar
                  src={boldMascot.src}
                  className={qaCardStyles.qa_card__avatar}
                />
              )
            ) : null}
            <p className={qaCardStyles.qa_card__title}>{title}</p>
          </div>
          {wiki.type === WikiType.QA && (
            <div className={qaCardStyles.answer}>
              <p className={qaCardStyles.answer_count_label}>回答</p>
              <p className={qaCardStyles.answer_count}>
                {answers?.length.toString()}
              </p>
            </div>
          )}
        </div>
        <div className={qaCardStyles.qa_card__below}>
          <div className={qaCardStyles.qa_card__tags}>
            <a className={qaCardStyles.qa_card_tag__item}>
              <Button colorScheme={tagButtonColor} color="white" size="xs">
                {wiki.type === WikiType.QA
                  ? 'Q&A'
                  : wiki.type === WikiType.RULES
                  ? '社内規則'
                  : 'ナレッジ'}
              </Button>
            </a>
            {tags && tags.length
              ? tags.map((t) => (
                  <Link href={`/wiki/list?tag=${t.id}`} key={t.id}>
                    <a className={qaCardStyles.qa_card_tag__item} key={t.id}>
                      <Button colorScheme={tagColorFactory(t.type)} size="xs">
                        {t.name}
                      </Button>
                    </a>
                  </Link>
                ))
              : null}
          </div>
          {wiki.type !== WikiType.RULES && (
            <p className={qaCardStyles.qa_card__date}>
              {dateTimeFormatterFromJSDDate({ dateTime: new Date(createdAt) })}
            </p>
          )}
        </div>
      </a>
    </Link>
  );
};

export default WikiCard;
