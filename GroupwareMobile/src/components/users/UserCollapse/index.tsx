import React from 'react';
import {useWindowDimensions} from 'react-native';
import {Collapse, CollapseProps, Div, Image, Text} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import {User} from '../../../types';

type UserCollapseProps = CollapseProps & {
  users: User[];
  title: string;
  bgColor: string;
  displayCount: boolean;
};

const UserCollapse: React.FC<UserCollapseProps> = ({
  users,
  title,
  bgColor,
  displayCount,
}) => {
  const windowWidth = useWindowDimensions().width;

  return (
    <Collapse>
      <Collapse.Header
        active
        fontSize={12}
        p="none"
        bg={bgColor}
        fontWeight="bold">
        <Text color="gray100">
          {title} {displayCount && `: ${users.length}名`}
        </Text>
      </Collapse.Header>
      <Collapse.Body pb="xl" rounded="md" bg="white">
        {users.map(u => (
          <Div
            borderBottomWidth={0.5}
            borderBottomColor="gray400"
            style={tailwind('flex-row items-center')}>
            <Image
              mt={'lg'}
              h={windowWidth * 0.1}
              w={windowWidth * 0.1}
              source={
                u.avatarUrl
                  ? {uri: u.avatarUrl}
                  : require('../../../../assets/no-image-avatar.png')
              }
              rounded="circle"
              mb={'lg'}
              mr={16}
            />
            <Text>{u.lastName + ' ' + u.firstName}</Text>
          </Div>
        ))}
      </Collapse.Body>
    </Collapse>
  );
};

export default UserCollapse;
