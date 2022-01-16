import React, {useEffect, useRef, useState} from 'react';
import {TouchableOpacity, useWindowDimensions} from 'react-native';
import {
  Button,
  Div,
  Dropdown,
  DropdownProps,
  Icon,
  Input,
  Modal,
  ModalProps,
  ScrollDiv,
  Text,
} from 'react-native-magnus';
import {DropdownOptionProps} from 'react-native-magnus/lib/typescript/src/ui/dropdown/dropdown.option.type';
import {useSelectedTags} from '../../../hooks/tag/useSelectedTags';
import {useTagType} from '../../../hooks/tag/useTagType';
import {AllTag, TagType, TagTypeInApp} from '../../../types';
import {tagTypeNameFactory} from '../../../utils/factory/tag/tagTypeNameFactory';

type TagModalContainerProps = Omit<ModalProps, 'children'>;

type TagModalProps = TagModalContainerProps & {
  onCloseModal: () => void;
  tags: AllTag[];
  onCompleteModal: (users: AllTag[]) => void;
  selectedTagType: TagTypeInApp;
  defaultSelectedTags?: Partial<AllTag>[];
};

const TagModal: React.FC<TagModalProps> = props => {
  const {
    onCompleteModal,
    onCloseModal,
    tags,
    selectedTagType: alreadySelectedTags,
    defaultSelectedTags,
  } = props;
  const [searchWords, setSearchWords] = useState<RegExpMatchArray | null>();
  const [modalTags, setModalTags] = useState(tags);

  const onChangeHandle = (t: string) => {
    const words = t
      .trim()
      .toLowerCase()
      .match(/[^\s]+/g);
    setSearchWords(words);
    return;
  };
  useEffect(() => {
    if (!searchWords) {
      setModalTags(tags);
      return;
    }
    const searchedTags = tags.filter(t =>
      searchWords.every(w => t.name.toLowerCase().indexOf(w) !== -1),
    );
    setModalTags(searchedTags);
  }, [searchWords, tags]);

  const {selectedTags, toggleTag, isSelected, clear} = useSelectedTags(
    defaultSelectedTags || [],
  );
  const {selectedTagType, selectTagType, filteredTags} = useTagType(
    alreadySelectedTags,
    modalTags,
  );
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
        bg="purple600"
        position="absolute"
        right={10}
        bottom={10}
        h={60}
        zIndex={20}
        rounded="circle"
        w={60}
        onPress={() => {
          onCompleteModal(selectedTags as AllTag[]);
          onCloseModal();
        }}>
        <Icon color="white" fontSize="6xl" name="check" />
      </Button>
      <Button
        bg="gray400"
        h={35}
        w={35}
        right={15}
        alignSelf="flex-end"
        rounded="circle"
        onPress={() => {
          clear();
          onCloseModal();
        }}>
        <Icon color="black" name="close" />
      </Button>
      <Div
        flexDir="column"
        alignItems="flex-start"
        alignSelf="center"
        mb={'lg'}>
        <Text mx={8}>タグを検索</Text>
        <Input
          autoCapitalize={'none'}
          mb={8}
          mx={8}
          onChangeText={v => onChangeHandle(v)}
        />

        <Text fontSize={16} mx={8}>
          タグのタイプを選択
        </Text>
        <Button
          mx={8}
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
        {filteredTags?.map(t => (
          <TouchableOpacity key={t.id} onPress={() => toggleTag(t)}>
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
