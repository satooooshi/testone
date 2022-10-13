import Link from 'next/link';
import React, { CSSProperties } from 'react';
import portalLinkBoxStyles from '@/styles/components/PortalLinkBox.module.scss';
import { FaSchool } from 'react-icons/fa';
import { GiBookCover, GiTeacher, GiPartyPopper } from 'react-icons/gi';
import { BsChatDotsFill } from 'react-icons/bs';
import { FaUserCog } from 'react-icons/fa';
import { FcSportsMode } from 'react-icons/fc';
import {
  RiAccountCircleFill,
  RiExchangeCnyFill,
  RiQuestionnaireFill,
  RiTimeLine,
} from 'react-icons/ri';
import { RiCalendarEventLine } from 'react-icons/ri';
import {
  MdAssignment,
  MdDeveloperBoard,
  MdPermContactCalendar,
  MdWork,
} from 'react-icons/md';
import { CgLoadbarDoc } from 'react-icons/cg';
import { GrMail } from 'react-icons/gr';
import { AiOutlineGlobal, AiFillBulb } from 'react-icons/ai';
import clsx from 'clsx';
import { useAuthenticate } from 'src/contexts/useAuthenticate';
import { FiMessageSquare } from 'react-icons/fi';

export enum PortalLinkType {
  FANRETURN = '/event/fanreturn',
  FAN_EVENT = '/event/fan_event',
  COACH = '/event/coach',
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
  ATTENDANCE_VIEW = '/attendance/view',
  APPLICATION = '/attendance/application',
  ATTENDANCE_REPORT = '/attendance/report',
  MYSCHEDULE = 'event/list?page=1&tag=&word=&status=past&from=2022-03-04&to=2022-04-11&personal=true',
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
    case PortalLinkType.FANRETURN:
      return (
        <GiBookCover
          className={clsx(
            portalLinkBoxStyles.icon,
            portalLinkBoxStyles.study_meeting_icon,
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
    case PortalLinkType.FAN_EVENT:
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
    case PortalLinkType.ATTENDANCE_VIEW:
      return <RiTimeLine style={{ ...iconStyle, color: 'darkred' }} />;
    case PortalLinkType.ATTENDANCE_REPORT:
      return <FiMessageSquare style={{ ...iconStyle, color: '#086f83' }} />;
    case PortalLinkType.APPLICATION:
      return <MdWork style={{ ...iconStyle, color: 'darkorange' }} />;
    case PortalLinkType.MYSCHEDULE:
      return (
        <RiCalendarEventLine
          className={clsx(
            portalLinkBoxStyles.icon,
            portalLinkBoxStyles.myschedule_icon,
          )}
        />
      );
    default:
      return <GiBookCover className={portalLinkBoxStyles.icon} />;
  }
};
export const eventTitleText = (href: PortalLinkType): string => {
  switch (href) {
    case PortalLinkType.FANRETURN:
      return 'ファンリターン';
    case PortalLinkType.COACH:
      return 'デビューサポート制度';
    case PortalLinkType.FAN_EVENT:
      return 'ファンイベント';
    case PortalLinkType.SUBMISSION_ETC:
      return '〆切一覧';
    case PortalLinkType.WIKI:
      return 'News';
    case PortalLinkType.RULES:
      return '社内規則';
    case PortalLinkType.ALL_POSTAL:
      return '運営からのお知らせ';
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
    case PortalLinkType.ATTENDANCE_VIEW:
      return '勤怠打刻';
    case PortalLinkType.ATTENDANCE_REPORT:
      return '勤怠報告';
    case PortalLinkType.APPLICATION:
      return '入社前申請';
    case PortalLinkType.MYSCHEDULE:
      return 'Myスケジュール';
    default:
      return '';
  }
};

const descriptionText = (href: PortalLinkType): string => {
  switch (href) {
    case PortalLinkType.FANRETURN:
      return 'ファンリターンはyoutubeやライバーが自分たちでイベントやレーベルを出すためにみんなの応援を集めるクラウドファンディング事業です。';
    case PortalLinkType.COACH:
      return 'ファンリターンは始めたばかりのアーティストを世に出すべく、発信したい想いを長年の芸能経験からサポートする制度です。いち早く多くの人に知ってもらいたいアーティストはぜひご利用ください。';
    case PortalLinkType.FAN_EVENT:
      return 'ファンリターンが立ち上げるファン交流会です。ライバーなど身近に交流できる至近距離イベントとなります。';
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
    case PortalLinkType.ATTENDANCE_VIEW:
      return '勤怠打刻についての申請や管理ができます。';
    case PortalLinkType.ATTENDANCE_REPORT:
      return '勤怠報告の申請や管理ができます。';
    case PortalLinkType.APPLICATION:
      return '入社前にかかった交通費などの申請ができます。';
    case PortalLinkType.MYSCHEDULE:
      return '各スケジュールを確認します';
    default:
      return '';
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
