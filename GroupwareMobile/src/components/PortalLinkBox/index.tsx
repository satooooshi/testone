import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Foundation from 'react-native-vector-icons/Foundation';
import Entypo from 'react-native-vector-icons/Entypo';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import {
  impressiveUniversityColor,
  studyMeetingColor,
  boldayColor,
  coachColor,
  clubColor,
  submissionEtcColor,
  wikiColor,
  chatColor,
  accountColor,
  adminColor,
  knowledgeColor,
  ruleColor,
  qaColor,
  allPostalColor,
} from '../../utils/colors';
import {Text, Div, Icon} from 'react-native-magnus';
import {TouchableHighlight, useWindowDimensions} from 'react-native';
import {portalLinkBoxStyles} from '../../styles/component/portalLinkBox.style';

type PortalType =
  | 'impressive_university'
  | 'study_meeting'
  | 'bolday'
  | 'coach'
  | 'club'
  | 'submission_etc'
  | 'wiki'
  | 'rules'
  | 'board'
  | 'knowledge'
  | 'qa'
  | 'all-postal'
  | 'chat'
  | 'admin'
  | 'my_schedule'
  | 'safety_confirmation'
  | 'salary'
  | 'users'
  | 'attendance'
  | 'account'
  | 'logout';

type PortalLinkIconProps = {
  type: PortalType;
};

const PortalLinkIcon: React.FC<PortalLinkIconProps> = ({type}) => {
  const windowWidth = useWindowDimensions().width;
  const iconSize = windowWidth * 0.1;
  switch (type) {
    case 'impressive_university':
      return (
        <FontAwesome5
          name="home"
          color={impressiveUniversityColor}
          size={iconSize}
        />
      );
    case 'study_meeting':
      return (
        <Entypo name="open-book" color={studyMeetingColor} size={iconSize} />
      );
    case 'bolday':
      return (
        <MaterialCommunityIcons
          name="party-popper"
          color={boldayColor}
          size={iconSize}
        />
      );
    case 'coach':
      return (
        <MaterialCommunityIcons
          name="teach"
          color={coachColor}
          size={iconSize}
        />
      );
    case 'club':
      return <FontAwesome5 name="running" color={clubColor} size={iconSize} />;
    case 'submission_etc':
      return (
        <AntDesign
          name="filetext1"
          color={submissionEtcColor}
          size={iconSize}
        />
      );
    case 'wiki':
      return (
        <Ionicons name="globe-outline" color={wikiColor} size={iconSize} />
      );
    case 'all-postal':
      return (
        <Icon
          name="mail"
          fontFamily="Entypo"
          color={allPostalColor}
          fontSize={iconSize}
        />
      );
    case 'knowledge':
      return (
        <Foundation name="lightbulb" color={knowledgeColor} size={iconSize} />
      );
    case 'rules':
      return (
        <Ionicons name="document-text" color={ruleColor} size={iconSize} />
      );
    case 'qa':
      return (
        <MaterialCommunityIcons
          name="comment-question-outline"
          color={qaColor}
          size={iconSize}
        />
      );
    case 'chat':
      return (
        <Ionicons
          name="chatbubble-ellipses"
          color={chatColor}
          size={iconSize}
        />
      );
    case 'account':
      return (
        <MaterialCommunityIcons
          name="account"
          color={accountColor}
          size={iconSize}
        />
      );
    case 'admin':
      return (
        <FontAwesome5 name="user-cog" color={adminColor} size={iconSize} />
      );
    case 'my_schedule':
      return <Icon name="calendar" color="orange500" fontSize={iconSize} />;
    case 'safety_confirmation':
      return (
        <Icon
          name="hand-holding-heart"
          fontFamily="FontAwesome5"
          fontSize={iconSize}
          color="pink600"
        />
      );
    case 'salary':
      return <Icon name="bank" fontSize={iconSize} color="yellow400" />;
    case 'board':
      return (
        <Icon
          name="bulletin-board"
          fontSize={iconSize}
          color="yellow400"
          fontFamily="MaterialCommunityIcons"
        />
      );
    case 'users':
      return (
        <Icon
          name="users"
          fontFamily="FontAwesome5"
          color="blue900"
          fontSize={iconSize}
        />
      );
    case 'attendance':
      return (
        <Icon
          name="external-link"
          fontSize={iconSize}
          color="red900"
          fontFamily="Feather"
        />
      );
    case 'logout':
      return (
        <Icon
          name="logout"
          fontSize={iconSize}
          color="gray900"
          fontFamily="MaterialIcons"
        />
      );
  }
};

type PortarlLinkBoxProps = {
  type: PortalType;
  onPress: () => void;
};

const PortalLinkBox: React.FC<PortarlLinkBoxProps> = ({type, onPress}) => {
  const eventTitleText = (href: PortalType): string => {
    switch (href) {
      case 'impressive_university':
        return '感動大学';
      case 'study_meeting':
        return '勉強会';
      case 'bolday':
        return 'BOLDay';
      case 'coach':
        return 'コーチ制度';
      case 'club':
        return '部活動';
      case 'submission_etc':
        return '〆切一覧';
      case 'wiki':
        return '社内Wiki';
      case 'rules':
        return '社内規則';
      case 'all-postal':
        return 'オール便';
      case 'knowledge':
        return 'ナレッジ';
      case 'qa':
        return 'Q&A';
      case 'chat':
        return 'チャット';
      case 'admin':
        return '管理者ページ';
      case 'account':
        return 'アカウント';
      case 'my_schedule':
        return 'Myスケジュール';
      case 'safety_confirmation':
        return '安否確認';
      case 'salary':
        return '給与明細';
      case 'board':
        return '掲示板';
      case 'users':
        return '社員名鑑';
      case 'attendance':
        return '勤怠管理';
      case 'logout':
        return 'ログアウト';
      default:
        return '';
    }
  };

  return (
    <TouchableHighlight onPress={onPress} style={portalLinkBoxStyles.wrapper}>
      <Div
        bg="white"
        h={100}
        w={'100%'}
        rounded="xl"
        justifyContent="center"
        p={8}
        alignItems="center">
        <Div mb={4}>
          <PortalLinkIcon type={type} />
        </Div>
        <Text fontWeight="bold" fontSize={20}>
          {eventTitleText(type)}
        </Text>
        {/* <Text fontSize="lg">{descriptionText(type)}</Text> */}
      </Div>
    </TouchableHighlight>
  );
};

export default PortalLinkBox;
