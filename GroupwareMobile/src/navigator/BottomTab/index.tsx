import React, {useEffect, useState} from 'react';
// import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Home from '../../screens/Home';
import Menu from '../../screens/Menu';
import EventList from '../../screens/event/EventList';
// import Wiki from '../../screens/wiki';
import {RootStackParamList} from '../../types/navigator/RootStackParamList';

import {darkFontColor} from '../../utils/colors';
import EventDetail from '../../screens/event/EventDetail';
import WikiDetail from '../../screens/wiki/WikiDetail';
import WikiList from '../../screens/wiki/WikiList';
import {createStackNavigator} from '@react-navigation/stack';
import PostWiki from '../../screens/wiki/PostWiki';
import {Badge, Icon, Text} from 'react-native-magnus';
import AccountDetail from '../../screens/account/AccountDetail';
import Profile from '../../screens/account/Profile';
import UpdatePassword from '../../screens/account/UpdatePassword';
import UserList from '../../screens/UserList';
import UserAdmin from '../../screens/admin/UserAdmin';
import UserRegisteringAdmin from '../../screens/admin/UserRegisteringAdmin';
import TagAdmin from '../../screens/admin/TagAdmin';
import Chat from '../../screens/Chat';
import RoomList from '../../screens/Chat/RoomList';
import NewRoom from '../../screens/Chat/NewRoom';
import EditWiki from '../../screens/wiki/EditWiki';
import ChatMenu from '../../screens/Chat/ChatMenu';
import ChatNotes from '../../screens/Chat/ChatMenu/ChatNote';
import PostChatNote from '../../screens/Chat/ChatMenu/ChatNote/PostChatNote';
import EditChatNote from '../../screens/Chat/ChatMenu/ChatNote/EditChatNote';
import PostAnswer from '../../screens/wiki/PostAnswer';
import ChatAlbums from '../../screens/Chat/ChatMenu/ChatAlbum';
import PostChatAlbum from '../../screens/Chat/ChatMenu/ChatAlbum/PostAlbum';
import AlbumDetail from '../../screens/Chat/ChatMenu/ChatAlbum/AlbumDetail';
import EditChatAlbum from '../../screens/Chat/ChatMenu/ChatAlbum/EditAlbum';
import UserTagAdmin from '../../screens/admin/UserTagAdmin';
import EditRoom from '../../screens/Chat/EditRoom';
import PostReply from '../../screens/wiki/PostReply';
import Share from '../../screens/Chat/Share';
import EventIntroduction from '../../screens/event/EventIntroduction';
import {useAuthenticate} from '../../contexts/useAuthenticate';
import {UserRole} from '../../types';
import WikiLinks from '../../screens/wiki/WikiLinks';
import {useHandleBadge} from '../../contexts/badge/useHandleBadge';
import {useIsTabBarVisible} from '../../contexts/bottomTab/useIsTabBarVisible';
import EditedProfile from '../../screens/admin/EditedProfile';
import AttendanceHome from '../../screens/attendance/AttendanceHome';
import Attendance from '../../screens/attendance/Attendance';
import Application from '../../screens/attendance/Application';
import DefaultAttendanceForm from '../../screens/attendance/DefaultAttendance';
import AttendanceReport from '../../screens/attendance/AttendanceReport';
import AttendanceReportDetail from '../../screens/attendance/AttendanceReportDetail';
import AttendanceVerifyReport from '../../screens/admin/attendance/AttendanceVerifyReport';
import IconBadge from 'react-native-icon-badge';

const Tab = createBottomTabNavigator();
// const Tab = createMaterialBottomTabNavigator();
const Stack = createStackNavigator();

const WikiStack = () => (
  <Stack.Navigator initialRouteName="WikiList">
    <Stack.Screen
      name="WikiLinks"
      component={WikiLinks}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="WikiDetail"
      component={WikiDetail}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="WikiList"
      component={WikiList}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="PostWiki"
      component={PostWiki}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="EditWiki"
      component={EditWiki}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="PostAnswer"
      component={PostAnswer}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="PostReply"
      component={PostReply}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="Share"
      component={Share}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

const EventStack = () => (
  <Stack.Navigator initialRouteName="EventList">
    <Stack.Screen
      name="EventList"
      component={EventList}
      options={{headerShown: false}}
    />

    <Stack.Screen
      name="EventDetail"
      component={EventDetail}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="Share"
      component={Share}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

const IntroStack = () => (
  <Stack.Navigator initialRouteName="EventIntroduction">
    <Stack.Screen
      name="EventIntroduction"
      component={EventIntroduction}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

const AccountStack = () => (
  <Stack.Navigator initialRouteName="MyProfile">
    <Stack.Screen
      name="MyProfile"
      component={AccountDetail}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="Profile"
      component={Profile}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="UpdatePassword"
      component={UpdatePassword}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="Share"
      component={Share}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

const UserListStack = () => (
  <Stack.Navigator initialRouteName="UserList">
    <Stack.Screen
      name="UserList"
      component={UserList}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="AccountDetail"
      component={AccountDetail}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);

const AdminStack = () => {
  const {user} = useAuthenticate();
  const isAdmin = user?.role === UserRole.ADMIN;
  return (
    <Stack.Navigator
      initialRouteName={isAdmin ? 'UserAdmin' : 'TagAdmin'}
      screenOptions={{animationEnabled: false}}>
      {isAdmin && (
        <>
          <Stack.Screen
            name="UserAdmin"
            component={UserAdmin}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="UserRegisteringAdmin"
            component={UserRegisteringAdmin}
            options={{headerShown: false}}
          />
        </>
      )}
      <Stack.Screen
        name="UserTagAdmin"
        component={UserTagAdmin}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="TagAdmin"
        component={TagAdmin}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="EditedProfile"
        component={EditedProfile}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AttendanceVerifyReportAdmin"
        component={AttendanceVerifyReport}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AttendanceReportAdmin"
        component={AttendanceVerifyReport}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AttendanceViewAdmin"
        component={AttendanceVerifyReport}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};

const ChatStack = () => (
  <Stack.Navigator initialRouteName="ChatStack">
    <Stack.Screen
      name="RoomList"
      component={RoomList}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="NewRoom"
      component={NewRoom}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="EditRoom"
      component={EditRoom}
      options={{headerShown: false}}
    />
    <Stack.Screen name="Chat" component={Chat} options={{headerShown: false}} />
    <Stack.Screen
      name="ChatMenu"
      component={ChatMenu}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="ChatNotes"
      component={ChatNotes}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="PostChatNote"
      component={PostChatNote}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="EditChatNote"
      component={EditChatNote}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="ChatAlbums"
      component={ChatAlbums}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="PostChatAlbum"
      component={PostChatAlbum}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="ChatAlbumDetail"
      component={AlbumDetail}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="EditChatAlbum"
      component={EditChatAlbum}
      options={{headerShown: false}}
    />
    <Stack.Screen
      name="Share"
      component={Share}
      options={{headerShown: false}}
    />
  </Stack.Navigator>
);
const AttendanceStack = () => {
  return (
    <Stack.Navigator initialRouteName={'AttendanceHome'}>
      <Stack.Screen
        name="AttendanceHome"
        component={AttendanceHome}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Attendance"
        component={Attendance}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="ApplicationBeforeJoining"
        component={Application}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="DefaultAttendance"
        component={DefaultAttendanceForm}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AttendanceReport"
        component={AttendanceReport}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="AttendanceReportDetail"
        component={AttendanceReportDetail}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
};
const BottomTab = () => {
  const {user} = useAuthenticate();
  const {unreadChatCount} = useHandleBadge();
  const isAdmin = user?.role === UserRole.ADMIN;
  const {isTabBarVisible} = useIsTabBarVisible();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: {color: 'white'},
        tabBarActiveTintColor: 'green400',
        tabBarStyle: {
          display: `${isTabBarVisible ? 'flex' : 'none'}`,
          backgroundColor: darkFontColor,
        },
      }}>
      {/* <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'ホーム',
          tabBarIcon: ({color}) => (
            <Icon
              name="home"
              fontFamily="MaterialCommunityIcons"
              color={color}
              fontSize={26}
            />
          ),
        }}
      /> */}
      <Tab.Screen
        name="AttendanceStack"
        component={AttendanceStack}
        options={{
          tabBarLabel: '勤怠管理',
          tabBarIcon: ({color}) => (
            <Icon
              name="work"
              fontFamily="MaterialIcons"
              color={color}
              fontSize={23}
            />
          ),
        }}
      />
      <Tab.Screen
        name="EventStack"
        component={EventStack}
        options={{
          tabBarLabel: 'イベント',
          tabBarIcon: ({color}) => (
            <Icon
              name="event"
              fontFamily="MaterialIcons"
              color={color}
              fontSize={23}
            />
          ),
        }}
      />
      <Tab.Screen
        name="WikiStack"
        component={WikiStack}
        options={{
          tabBarLabel: 'News',
          tabBarIcon: ({color}) => (
            <Icon
              name="globe-outline"
              fontFamily="Ionicons"
              color={color}
              fontSize={23}
            />
          ),
        }}
      />
      <Tab.Screen
        name="UsersStack"
        component={UserListStack}
        options={{
          tabBarItemStyle: {display: 'none'},
          tabBarLabel: 'メンバー',
          tabBarIcon: ({color}) => (
            <Icon
              name="users"
              fontFamily="FontAwesome5"
              color={color}
              fontSize={21}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ChatStack"
        component={ChatStack}
        options={{
          tabBarLabel: 'チャット',
          tabBarIcon: ({color}) => (
            <>
              {unreadChatCount > 0 ? (
                <IconBadge
                  MainElement={
                    <Icon
                      name="ios-chatbubble-ellipses"
                      fontFamily="Ionicons"
                      color={color}
                      fontSize={23}
                    />
                  }
                  BadgeElement={
                    <Text color="white" fontSize={10}>
                      {unreadChatCount}
                    </Text>
                  }
                  IconBadgeStyle={{
                    marginTop: -10,
                    marginRight: -10,
                    minWidth: 18,
                    width: 18,
                    height: 18,
                    backgroundColor: 'red',
                  }}
                />
              ) : (
                <Icon
                  name="ios-chatbubble-ellipses"
                  fontFamily="Ionicons"
                  color={color}
                  fontSize={23}
                />
              )}
            </>
          ),
        }}
      />
      <Tab.Screen
        name="AccountStack"
        component={AccountStack}
        options={{
          tabBarItemStyle: {display: 'none'},
          tabBarLabel: 'アカウント',
          tabBarIcon: ({color}) => (
            <>
              <Icon
                name="user-alt"
                fontFamily="FontAwesome5"
                color={color}
                fontSize={23}
              />
            </>
          ),
        }}
      />

      <Tab.Screen
        name="AdminStack"
        component={AdminStack}
        options={{
          tabBarItemStyle: {display: 'none'},
          tabBarLabel: '管理',
          tabBarIcon: ({color}) =>
            isAdmin ? (
              <Icon
                name="user-cog"
                fontFamily="FontAwesome5"
                color={color}
                fontSize={23}
                mr={-5}
              />
            ) : (
              <Icon name="tags" color={color} fontSize={26} />
            ),
        }}
      />
      <Tab.Screen
        name="Menu"
        component={Menu}
        options={{
          tabBarLabel: 'メニュー',
          tabBarIcon: ({color}) => (
            <>
              <Icon
                name="menu"
                fontFamily="Feather"
                color={color}
                fontSize={23}
              />
            </>
          ),
        }}
      />

      <Tab.Screen
        name="IntroStack"
        component={IntroStack}
        options={{
          tabBarItemStyle: {display: 'none'},
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTab;
