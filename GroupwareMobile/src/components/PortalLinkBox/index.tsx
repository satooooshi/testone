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
  mailMagazineColor,
  interviewColor,
} from '../../utils/colors';
import {Text, Div, Icon} from 'react-native-magnus';
import {TouchableHighlight} from 'react-native';
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
  | 'mail_magazine'
  | 'interview'
  | 'chat'
  | 'admin'
  | 'my_schedule'
  | 'safety_confirmation'
  | 'salary'
  | 'users'
  | 'attendance'
  | 'account'
  | 'logout'
  | 'attendance_report'
  | 'application'
  | 'work'
  | 'account'
  | 'user_admin'
  | 'user_registering_admin'
  | 'tag_admin'
  | 'user_tag_admin'
  | 'update_password';

type PortalLinkIconProps = {
  type: PortalType;
};

const PortalLinkIcon: React.FC<PortalLinkIconProps> = ({type}) => {
  const iconSize = 30;
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
    case 'mail_magazine':
      return (
        <Icon
          name="paper-plane"
          fontFamily="Entypo"
          color={mailMagazineColor}
          fontSize={iconSize}
        />
      );
    case 'interview':
      return (
        <Icon
          name="microphone-variant"
          fontFamily="MaterialCommunityIcons"
          color={interviewColor}
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

    case 'work':
      return (
        <Icon
          name="work"
          fontSize={iconSize}
          color="'#086f83'"
          fontFamily="MaterialIcons"
        />
      );
    case 'attendance':
      return (
        <Icon
          name="time-outline"
          fontSize={iconSize}
          color="red900"
          fontFamily="Ionicons"
        />
      );
    case 'attendance_report':
      return (
        <Icon
          name="message-square"
          fontSize={iconSize}
          color="#086f83"
          fontFamily="Feather"
        />
      );
    case 'logout':
      return <Icon name="logout" fontSize={iconSize} color="gray900" />;
    case 'application':
      return (
        <Icon
          name="work-outline"
          fontSize={iconSize}
          color="orange600"
          fontFamily="MaterialIcons"
        />
      );
    case 'user_admin':
      return (
        <FontAwesome5 name="user-cog" color={adminColor} size={iconSize} />
      );
    case 'user_registering_admin':
      return <AntDesign name="adduser" size={iconSize} color="red900" />;
    case 'tag_admin':
      return <AntDesign name="tago" size={iconSize} color="black" />;
    case 'user_tag_admin':
      return <FontAwesome5 name="user-tag" size={iconSize} color="red900" />;
    case 'update_password':
      return (
        <Icon
          name="setting"
          fontFamily="AntDesign"
          fontSize={iconSize}
          color="black"
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
        return '????????????';
      case 'study_meeting':
        return '?????????';
      case 'bolday':
        return 'BOLDay';
      case 'coach':
        return '???????????????';
      case 'club':
        return '?????????';
      case 'submission_etc':
        return '????????????';
      case 'wiki':
        return '??????Wiki';
      case 'rules':
        return '????????????';
      case 'all-postal':
        return '????????????';
      case 'mail_magazine':
        return '????????????';
      case 'interview':
        return '???????????????????????????';
      case 'knowledge':
        return '????????????';
      case 'qa':
        return 'Q&A';
      case 'chat':
        return '????????????';
      case 'admin':
        return '???????????????';
      case 'account':
        return '???????????????';
      case 'my_schedule':
        return 'My??????????????????';
      case 'safety_confirmation':
        return '????????????';
      case 'salary':
        return '????????????';
      case 'board':
        return '?????????';
      case 'users':
        return '????????????';
      case 'attendance':
        return '????????????';
      case 'logout':
        return '???????????????';
      case 'application':
        return '???????????????';
      case 'attendance_report':
        return '????????????';
      case 'user_admin':
        return '??????????????????';
      case 'user_registering_admin':
        return '??????????????????';
      case 'tag_admin':
        return '????????????';
      case 'user_tag_admin':
        return '????????????(????????????)';
      case 'update_password':
        return '?????????????????????';
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
        p={24}>
        <Div mb={12} alignSelf="flex-start">
          <PortalLinkIcon type={type} />
        </Div>
        <Text fontWeight="bold" fontSize={16}>
          {eventTitleText(type)}
        </Text>
        {/* <Text fontSize="lg">{descriptionText(type)}</Text> */}
      </Div>
    </TouchableHighlight>
  );
};

export default PortalLinkBox;
