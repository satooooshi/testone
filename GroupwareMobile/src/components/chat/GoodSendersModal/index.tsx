import React, {useEffect} from 'react';
import {FlatList, View} from 'react-native';
import {
  Button,
  Div,
  Icon,
  Text,
  Modal as MagnusModal,
} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import {useAPIGetGoodsForBoard} from '../../../hooks/api/wiki/useAPIGetGoodForBoard';
import {User, UserGoodForBoard} from '../../../types';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import UserAvatar from '../../common/UserAvatar';

type GoodSendersModalProps = {
  isVisible: boolean;
  onClose: () => void;
  goodsForBoard: UserGoodForBoard[];
};

const GoodSendersModal: React.FC<GoodSendersModalProps> = ({
  isVisible,
  onClose,
  goodsForBoard,
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
          data={goodsForBoard}
          renderItem={({item}) => (
            <View style={tailwind('flex-row bg-white items-center px-4 mb-2')}>
              <>
                <Div mr={'sm'}>
                  <UserAvatar
                    user={item.user}
                    h={64}
                    w={64}
                    onCloseModal={() => onClose()}
                  />
                </Div>

                <Text fontSize={18}>{userNameFactory(item.user)}</Text>
              </>
            </View>
          )}
        />
      </>
    </MagnusModal>
  );
};

export default GoodSendersModal;
