import React, { useMemo } from 'react';
import qaCardStyles from '@/styles/components/QACard.module.scss';
import { dateTimeFormatterFromJSDDate } from 'src/utils/dateTimeFormatter';
import { QAQuestion, WikiType } from 'src/types';
import Link from 'next/link';
import { Avatar, Button } from '@chakra-ui/react';

type QACardProps = {
  qaQuestion: QAQuestion;
};

const QACard: React.FC<QACardProps> = ({ qaQuestion }) => {
  const { title, writer, tags, createdAt, answers } = qaQuestion;
  const tagButtonColor = useMemo(() => {
    switch (qaQuestion.type) {
      case WikiType.QA:
        return '#00b5d8';
      case WikiType.KNOWLEDGE:
        return '#ecc94b';
      case WikiType.RULES:
        return '#38a169';
    }
  }, [qaQuestion.type]);

  return (
    <Link href={`/wiki/${qaQuestion.id}`}>
      <a className={qaCardStyles.qa_card__item}>
        <div className={qaCardStyles.qa_card__top}>
          <div className={qaCardStyles.qa_card_user_info_wrapper}>
            {qaQuestion.type !== WikiType.RULES && writer ? (
              <Link href={`/account/${writer?.id}`} passHref>
                <a>
                  <Avatar
                    src={writer?.avatarUrl}
                    className={qaCardStyles.qa_card__avatar}
                  />
                </a>
              </Link>
            ) : null}
            <p className={qaCardStyles.qa_card__title}>{title}</p>
          </div>
          {qaQuestion.type === WikiType.QA && (
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
              <Button background={tagButtonColor} color="white" height="28px">
                {qaQuestion.type === WikiType.QA
                  ? 'Q&A'
                  : qaQuestion.type === WikiType.RULES
                  ? '社内規則'
                  : 'ナレッジ'}
              </Button>
            </a>
            {tags && tags.length
              ? tags.map((t) => (
                  <Link href={`/wiki/list?tag=${t.id}`} key={t.id}>
                    <a className={qaCardStyles.qa_card_tag__item} key={t.id}>
                      <Button
                        background={tagButtonColor}
                        color="white"
                        height="28px">
                        {t.name}
                      </Button>
                    </a>
                  </Link>
                ))
              : null}
          </div>
          {qaQuestion.type === WikiType.QA && (
            <p className={qaCardStyles.qa_card__date}>
              {dateTimeFormatterFromJSDDate({ dateTime: new Date(createdAt) })}
            </p>
          )}
        </div>
      </a>
    </Link>
  );
};

export default QACard;
