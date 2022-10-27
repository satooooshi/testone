import React from 'react';
import {FlatList, ScrollView, TouchableHighlight, View} from 'react-native';
import {
  Button,
  Div,
  Icon,
  Modal as MagnusModal,
  Text,
} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import {ChatMessageReaction} from '../../../types';
import {userNameFactory} from '../../../utils/factory/userNameFactory';
import {numbersOfSameValueInKeyOfObjArr} from '../../../utils/numbersOfSameValueInKeyOfObjArr';
import {removeReactionDuplicates} from '../../../utils/removeReactionDuplicate';
import UserAvatar from '../../common/UserAvatar';

type ReactionsModalProps = {
  isVisible: boolean;
  selectedReactions?: ChatMessageReaction[];
  selectedEmoji?: string;
  onPressCloseButton: () => void;
  deletedReactionIds?: number[];
  onPressEmoji: (emoji: string) => void;
};

const ReactionsModal: React.FC<ReactionsModalProps> = ({
  isVisible,
  selectedReactions,
  selectedEmoji,
  onPressCloseButton,
  deletedReactionIds = [],
  onPressEmoji,
}) => {
  return (
    <MagnusModal isVisible={isVisible} h={400}>
      <Button
        bg="gray400"
        h={35}
        w={35}
        right={0}
        alignSelf="flex-end"
        rounded="circle"
        onPress={onPressCloseButton}>
        <Icon color="black" name="close" />
      </Button>
      {selectedReactions ? (
        <>
          <ScrollView horizontal style={tailwind('max-h-10 mb-2')}>
            {removeReactionDuplicates(selectedReactions)
              .filter(r => !deletedReactionIds.includes(r.id))
              .map((r, index) => (
                <TouchableHighlight
                  underlayColor="none"
                  onPress={() => onPressEmoji(r.emoji)}>
                  <Div
                    px="lg"
                    py="xs"
                    w="100%"
                    flexDir="row"
                    alignItems="center"
                    borderBottomColor={
                      selectedEmoji === r.emoji ||
                      (!selectedEmoji && index === 0)
                        ? 'blue600'
                        : undefined
                    }
                    borderBottomWidth={
                      selectedEmoji === r.emoji ||
                      (!selectedEmoji && index === 0)
                        ? 2
                        : undefined
                    }>
                    <Text fontSize={24} mr="xs">
                      {r.emoji}
                    </Text>
                    <Text fontSize={16}>
                      {numbersOfSameValueInKeyOfObjArr(
                        selectedReactions as ChatMessageReaction[],
                        r,
                        'emoji',
                      )}
                    </Text>
                  </Div>
                </TouchableHighlight>
              ))}
          </ScrollView>
          <FlatList
            data={
              selectedEmoji
                ? selectedReactions.filter(r => r.emoji === selectedEmoji)
                : removeReactionDuplicates(selectedReactions).filter(
                    r => !deletedReactionIds.includes(r.id),
                  ).length
                ? selectedReactions.filter(
                    r =>
                      r.emoji ===
                      removeReactionDuplicates(selectedReactions).filter(
                        parsedR => !deletedReactionIds.includes(parsedR.id),
                      )[0].emoji,
                  )
                : []
            }
            renderItem={({item}) => (
              <View
                style={tailwind('flex-row bg-white items-center px-4 mb-2')}>
                <>
                  <Div mr={'sm'}>
                    <UserAvatar
                      user={item.user}
                      h={64}
                      w={64}
                      onCloseModal={() => onPressCloseButton()}
                    />
                  </Div>

                  <Text fontSize={18}>{userNameFactory(item.user)}</Text>
                </>
              </View>
            )}
          />
        </>
      ) : (
        <></>
      )}
    </MagnusModal>
  );
};

export default ReactionsModal;
