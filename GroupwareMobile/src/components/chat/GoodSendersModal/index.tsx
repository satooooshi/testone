import React from 'react';
import {FlatList, View} from 'react-native';
import {
  Button,
  Div,
  Icon,
  Text,
  Modal as MagnusModal,
} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import {User} from '../../../types';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import UserAvatar from '../../common/UserAvatar';

type GoodSendersModalProps = {
  goodSenders: User[];
  isVisible: boolean;
  onClose: () => void;
};

const GoodSendersModal: React.FC<GoodSendersModalProps> = ({
  goodSenders,
  isVisible,
  onClose,
}) => {
  return (
    <MagnusModal isVisible={isVisible} h={400}>
      <>
        <Button
          bg="gray400"
          h={35}
          w={35}
          right={0}
          alignSelf="flex-end"
          rounded="circle"
          onPress={onClose}>
          <Icon color="black" name="close" />
        </Button>
        <FlatList
          data={goodSenders}
          renderItem={({item}) => (
            <View style={tailwind('flex-row bg-white items-center px-4 mb-2')}>
              <>
                <Div mr={'sm'}>
                  <UserAvatar
                    user={item}
                    h={64}
                    w={64}
                    onCloseModal={() => onClose()}
                  />
                </Div>

                <Text fontSize={18}>{userNameFactory(item)}</Text>
              </>
            </View>
          )}
        />
      </>
    </MagnusModal>
  );
};

export default GoodSendersModal;
