import React, {useRef} from 'react';
import {TouchableOpacity, useWindowDimensions} from 'react-native';
import {
  Button,
  Div,
  Dropdown,
  DropdownProps,
  Icon,
  Modal,
  ModalProps,
  ScrollDiv,
  Text,
} from 'react-native-magnus';
import {DropdownOptionProps} from 'react-native-magnus/lib/typescript/src/ui/dropdown/dropdown.option.type';
import {AllTag, TagType, TagTypeInApp} from '../../../types';
import {tagTypeNameFactory} from '../../../utils/factory/tag/tagTypeNameFactory';

type TagModalContainerProps = Omit<ModalProps, 'children'>;

type TagModalProps = TagModalContainerProps & {
  onCloseModal: () => void;
  tags: AllTag[];
  onPressTag: (tag: AllTag) => void;
  isSelected: (tag: AllTag) => boolean;
  selectedTagType: TagTypeInApp;
  selectTagType: (tagType: TagTypeInApp) => void;
};

const TagModal: React.FC<TagModalProps> = props => {
  const {
    onCloseModal,
    tags,
    onPressTag,
    isSelected,
    selectedTagType,
    selectTagType,
  } = props;
  const dropdownRef = useRef<any | null>(null);
  const defaultDropdownProps: Partial<DropdownProps> = {
    m: 'md',
    pb: 'md',
    showSwipeIndicator: false,
    roundedTop: 'xl',
  };
  const defaultDropdownOptionProps: Partial<DropdownOptionProps> = {
    bg: 'gray100',
    color: 'blue600',
    py: 'lg',
    px: 'xl',
    borderBottomWidth: 1,
    borderBottomColor: 'gray200',
    justifyContent: 'center',
    roundedTop: 'lg',
  };
  const {width: windowWidth} = useWindowDimensions();
  return (
    <Modal {...props}>
      <Button
        bg="gray400"
        h={35}
        w={35}
        right={15}
        alignSelf="flex-end"
        rounded="circle"
        onPress={onCloseModal}>
        <Icon color="black" name="close" />
      </Button>
      <Div
        flexDir="column"
        alignItems="flex-start"
        alignSelf="center"
        mb={'lg'}>
        <Text fontSize={16}>タグのタイプを選択</Text>
        <Button
          alignSelf="center"
          block
          w={windowWidth * 0.9}
          suffix={
            <Icon position="absolute" right={8} name="down" color="white" />
          }
          bg="blue600"
          p={12}
          color="white"
          onPress={() => dropdownRef.current?.open()}
          rounded="md">
          {tagTypeNameFactory(selectedTagType)}
        </Button>
      </Div>
      <Dropdown
        {...defaultDropdownProps}
        title="入力形式を選択"
        ref={dropdownRef}>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => selectTagType('All')}
          value={'All'}>
          全て
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => selectTagType(TagType.TECH)}
          value={TagType.TECH}>
          {tagTypeNameFactory(TagType.TECH)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => selectTagType(TagType.QUALIFICATION)}
          value={TagType.QUALIFICATION}>
          {tagTypeNameFactory(TagType.QUALIFICATION)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => selectTagType(TagType.CLUB)}
          value={TagType.CLUB}>
          {tagTypeNameFactory(TagType.CLUB)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => selectTagType(TagType.HOBBY)}
          value={TagType.HOBBY}>
          {tagTypeNameFactory(TagType.HOBBY)}
        </Dropdown.Option>
        <Dropdown.Option
          {...defaultDropdownOptionProps}
          onPress={() => selectTagType(TagType.OTHER)}
          value={TagType.OTHER}>
          {tagTypeNameFactory(TagType.OTHER)}
        </Dropdown.Option>
      </Dropdown>
      <ScrollDiv>
        {tags.map(t => (
          <TouchableOpacity key={t.id} onPress={() => onPressTag(t)}>
            <Div
              w={windowWidth}
              minH={40}
              bg={isSelected(t) ? 'gray300' : 'white'}
              borderBottomWidth={1}
              px={10}
              justifyContent="center"
              borderBottomColor="gray500">
              <Text fontSize={16}>{t.name}</Text>
            </Div>
          </TouchableOpacity>
        ))}
      </ScrollDiv>
    </Modal>
  );
};

export default TagModal;
