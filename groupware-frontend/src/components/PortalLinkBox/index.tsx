import Link from 'next/link';
import React, { CSSProperties } from 'react';
import portalLinkBoxStyles from '@/styles/components/PortalLinkBox.module.scss';
import { FaSchool } from 'react-icons/fa';
import { GiBookCover, GiTeacher, GiPartyPopper } from 'react-icons/gi';
import { BsChatDotsFill } from 'react-icons/bs';
import { FaUserCog } from 'react-icons/fa';
import { FcSportsMode } from 'react-icons/fc';
import { RiAccountCircleFill, RiQuestionnaireFill } from 'react-icons/ri';
import { MdAssignment, MdDeveloperBoard, MdWork } from 'react-icons/md';
import { CgLoadbarDoc } from 'react-icons/cg';
import { GrMail } from 'react-icons/gr';
import { AiOutlineGlobal, AiFillBulb } from 'react-icons/ai';
import clsx from 'clsx';
import { useAuthenticate } from 'src/contexts/useAuthenticate';

export enum PortalLinkType {
  IMPRESSIVE_UNIVERSITY = '/event/impressive_university',
  STUDY_MEETING = '/event/study_meeting',
  BOLDAY = '/event/bolday',
  COACH = '/event/coach',
  CLUB = '/event/club',
  SUBMISSION_ETC = '/event/list?type=submission_etc&from=&to=',
  WIKI = '/wiki',
  RULES = '/wiki/list?type=rule&rule_category=philosophy',
  ALL_POSTAL = '/wiki/list?type=all-postal',
  KNOWLEDGE = '/wiki/list?type=knowledge',
  QA = `/wiki/list?type=qa`,
  BOARD = `/wiki/list?type=board`,
  CHAT = '/chat',
  ADMIN = '/admin/users',
  ACCOUNT = '/account',
  ATTENDANCE = '/attendance',
}

type PortarlLinkBoxProps = {
  href: PortalLinkType;
};

type PortalProps = {
  href: PortalLinkType;
};

const PortalIcon: React.FC<PortalProps> = ({ href }) => {
  const iconStyle: CSSProperties = {
    width: '144px',
    height: '144px',
    marginBottom: '16px',
  };
  switch (href) {
    case PortalLinkType.IMPRESSIVE_UNIVERSITY:
      return (
        <FaSchool
          className={clsx(
            portalLinkBoxStyles.icon,
            portalLinkBoxStyles.impressive_university_icon,
          )}
        />
      );
    case PortalLinkType.STUDY_MEETING:
      return (
        <GiBookCover
          className={clsx(
            portalLinkBoxStyles.icon,
            portalLinkBoxStyles.study_meeting_icon,
          )}
        />
      );
    case PortalLinkType.BOLDAY:
      return (
        <GiPartyPopper
          className={clsx(
            portalLinkBoxStyles.icon,
            portalLinkBoxStyles.bolday_icon,
          )}
        />
      );
    case PortalLinkType.COACH:
      return (
        <GiTeacher
          className={clsx(
            portalLinkBoxStyles.icon,
            portalLinkBoxStyles.coach_icon,
          )}
        />
      );
    case PortalLinkType.CLUB:
      return (
        <FcSportsMode
          className={clsx(
            portalLinkBoxStyles.icon,
            portalLinkBoxStyles.club_icon,
          )}
        />
      );
    case PortalLinkType.SUBMISSION_ETC:
      return (
        <MdAssignment
          className={clsx(
            portalLinkBoxStyles.icon,
            portalLinkBoxStyles.submission_etc_icon,
          )}
        />
      );
    case PortalLinkType.WIKI:
      return (
        <AiOutlineGlobal
          className={clsx(
            portalLinkBoxStyles.icon,
            portalLinkBoxStyles.wiki_icon,
          )}
        />
      );
    case PortalLinkType.ALL_POSTAL:
      return (
        <GrMail
          className={clsx(
            portalLinkBoxStyles.icon,
            portalLinkBoxStyles.all_postal,
          )}
        />
      );
    case PortalLinkType.RULES:
      return (
        <CgLoadbarDoc
          className={clsx(
            portalLinkBoxStyles.icon,
            portalLinkBoxStyles.rules_icon,
          )}
        />
      );
    case PortalLinkType.KNOWLEDGE:
      return (
        <AiFillBulb
          className={clsx(
            portalLinkBoxStyles.icon,
            portalLinkBoxStyles.knowledge_icon,
          )}
        />
      );
    case PortalLinkType.QA:
      return (
        <RiQuestionnaireFill
          className={clsx(
            portalLinkBoxStyles.icon,
            portalLinkBoxStyles.qa_icon,
          )}
        />
      );
    case PortalLinkType.CHAT:
      return (
        <BsChatDotsFill
          className={clsx(
            portalLinkBoxStyles.icon,
            portalLinkBoxStyles.chat_icon,
          )}
        />
      );
    case PortalLinkType.ADMIN:
      return (
        <FaUserCog
          className={clsx(
            portalLinkBoxStyles.icon,
            portalLinkBoxStyles.admin_icon,
          )}
        />
      );
    case PortalLinkType.ACCOUNT:
      return (
        <RiAccountCircleFill
          className={clsx(
            portalLinkBoxStyles.icon,
            portalLinkBoxStyles.account_icon,
          )}
        />
      );
    case PortalLinkType.BOARD:
      return (
        <MdDeveloperBoard
          className={clsx(
            portalLinkBoxStyles.icon,
            portalLinkBoxStyles.account_icon,
          )}
        />
      );
    case PortalLinkType.ATTENDANCE:
      return <MdWork style={{ ...iconStyle, color: '#086f83' }} />;
  }
};
export const eventTitleText = (href: PortalLinkType): string => {
  switch (href) {
    case PortalLinkType.IMPRESSIVE_UNIVERSITY:
      return '感動大学';
    case PortalLinkType.STUDY_MEETING:
      return '勉強会';
    case PortalLinkType.BOLDAY:
      return 'BOLDay';
    case PortalLinkType.COACH:
      return 'コーチ制度';
    case PortalLinkType.CLUB:
      return '部活動';
    case PortalLinkType.SUBMISSION_ETC:
      return '提出物等';
    case PortalLinkType.WIKI:
      return '社内Wiki';
    case PortalLinkType.RULES:
      return '社内規則';
    case PortalLinkType.ALL_POSTAL:
      return 'オール便';
    case PortalLinkType.KNOWLEDGE:
      return 'ナレッジ';
    case PortalLinkType.QA:
      return 'Q&A';
    case PortalLinkType.CHAT:
      return 'チャット';
    case PortalLinkType.ADMIN:
      return '管理者ページ';
    case PortalLinkType.ACCOUNT:
      return 'アカウント';
    case PortalLinkType.BOARD:
      return '掲示板';
    case PortalLinkType.ATTENDANCE:
      return '勤怠管理';
  }
};

const descriptionText = (href: PortalLinkType): string => {
  switch (href) {
    case PortalLinkType.IMPRESSIVE_UNIVERSITY:
      return '技術力と人間力を 毎日プロから学ぶことが出来る研修制度です。';
    case PortalLinkType.STUDY_MEETING:
      return '社員同士が教え合いながら、知識を深めていく勉強会です。';
    case PortalLinkType.BOLDAY:
      return '社員同士が高めあう風土が生まれる帰社日';
    case PortalLinkType.COACH:
      return '現場経験の豊富なエキスパート陣が、様々な視点から社員へアドバイスや指導を行います。';
    case PortalLinkType.CLUB:
      return '17部活、14サークルが活動中。部活として認定された活動には懇親会費を支給しています。フットサルやマラソン等のスポーツ系から、写真や料理等の文化系の部活まで様々な部活動があります。';
    case PortalLinkType.SUBMISSION_ETC:
      return '社内での提出物の日程を確認します';
    case PortalLinkType.WIKI:
      return '社内規則/ナレッジ/Q&Aを共有する総合的な情報共有スペースです';
    case PortalLinkType.RULES:
      return '社内規則を共有し、社員の業務を促進します';
    case PortalLinkType.ALL_POSTAL:
      return `会社から全社員に向けての重要連絡事項です。今後の提出期限や重要なお知らせを記載しています。
毎週金曜日に更新しますので必ず確認してください。`;
    case PortalLinkType.KNOWLEDGE:
      return '社員がお互いに効率的な業務を促進し知識共有スペースです。業務での不明点解決に役立ちます';
    case PortalLinkType.QA:
      return '社員同士が質問、回答しあい、他社員の質問や回答を通して自身の知見を更に深める事が出来ます。';
    case PortalLinkType.CHAT:
      return '気軽にチャット、連携しあい、業務の効率を高めます。';
    case PortalLinkType.ADMIN:
      return '各ユーザーの管理を管理者権限で行ないます。';
    case PortalLinkType.ACCOUNT:
      return '自分のアカウント情報を編集します。';
    case PortalLinkType.BOARD:
      return 'ナレッジやQ&Aなど、社内で情報共有をする掲示板です。';
    case PortalLinkType.ATTENDANCE:
      return '勤怠についての申請や管理ができます。';
  }
};

const PortalLinkBox: React.FC<PortarlLinkBoxProps> = ({ href }) => {
  const { user } = useAuthenticate();
  const hrefFactory = () => {
    if (href === PortalLinkType.ACCOUNT) {
      return PortalLinkType.ACCOUNT + `/${user?.id}`;
    }
    return href;
  };
  return (
    <Link href={hrefFactory()}>
      <a className={portalLinkBoxStyles.box_wrapper}>
        <PortalIcon href={href} />
        <div className={portalLinkBoxStyles.title_wrapper}>
          <p className={portalLinkBoxStyles.title_text}>
            {eventTitleText(href)}
          </p>
        </div>
        <div className={portalLinkBoxStyles.description_wrapper}>
          <p className={portalLinkBoxStyles.description_text}>
            {descriptionText(href)}
          </p>
        </div>
      </a>
    </Link>
  );
};

export default PortalLinkBox;
