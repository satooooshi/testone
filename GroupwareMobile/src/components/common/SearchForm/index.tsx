import React, {useEffect, useState} from 'react';
import {useGetTagsBySearchTarget} from '../../../hooks/tag/useGetTagsBySearchTarget';
import {KeyboardAvoidingView} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {
  Button,
  Div,
  Icon,
  Input,
  Modal,
  Overlay,
  Tag,
} from 'react-native-magnus';
import {useAPIGetTag} from '../../../hooks/api/tag/useAPIGetTag';
import {useSelectedTags} from '../../../hooks/tag/useSelectedTags';
import {useTagType} from '../../../hooks/tag/useTagType';
import {AllTag} from '../../../types';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
import TagModal from '../TagModal';

export type SearchFormValue = {
  word: string;
  selectedTags: AllTag[];
};

export type SearchTarget = 'user' | 'other';

type SearchFormProps = {
  searchTarget: SearchTarget;
  defaultValue?: SearchFormValue;
  isVisible: boolean;
  onCloseModal: () => void;
  onSubmit: (value: SearchFormValue) => void;
  defaultSelectedTagIds?: number[];
};

const SearchForm: React.FC<SearchFormProps> = ({
  searchTarget,
  defaultValue,
  isVisible,
  onCloseModal,
  onSubmit,
  defaultSelectedTagIds = [],
}) => {
  const {data: tags} = useGetTagsBySearchTarget(searchTarget)();
  const [word, setWord] = useState(defaultValue?.word || '');
  const [visibleTagModal, setVisibleTagModal] = useState(false);
  const {selectedTags, toggleTag, isSelected, setSelectedTags} =
    useSelectedTags(defaultValue?.selectedTags);
  const {selectedTagType, selectTagType, filteredTags} = useTagType(
    'All',
    tags,
  );

  useEffect(() => {
    if (defaultSelectedTagIds.length && !selectedTags.length) {
      const def = tags?.filter(t =>
        defaultSelectedTagIds.includes(Number(t.id)),
      );
      if (def?.length) {
        setSelectedTags(def);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultSelectedTagIds, setSelectedTags]);

  useEffect(() => {
    if (defaultValue && defaultValue.selectedTags.length) {
      setSelectedTags(defaultValue.selectedTags);
    }
  }, [defaultValue, setSelectedTags]);

  return (
    <Overlay
      px={16}
      py={32}
      h={240 + selectedTags.length * 8}
      visible={isVisible}>
      <Button
        bg="gray400"
        h={35}
        w={35}
        position="absolute"
        right={-10}
        top={-15}
        rounded="circle"
        onPress={onCloseModal}>
        <Icon color="black" name="close" />
      </Button>
      <TagModal
        isVisible={visibleTagModal}
        onCloseModal={() => setVisibleTagModal(false)}
        tags={filteredTags || []}
        onPressTag={toggleTag}
        isSelected={isSelected}
        selectTagType={selectTagType}
        selectedTagType={selectedTagType}
      />
      <Div>
        <Input
          placeholder="検索ワードを入力してください"
          mb={8}
          value={word}
          autoCapitalize="none"
          onChangeText={text => {
            setWord(text);
          }}
        />
        <Button
          w={'100%'}
          bg="green600"
          mb={8}
          onPress={() => setVisibleTagModal(true)}>
          {selectedTags.length
            ? `${selectedTags.length}個のタグを選択済み`
            : 'タグを選択'}
        </Button>
        <Div flexDir="row" flexWrap="wrap">
          {selectedTags.map(t => (
            <Tag
              key={t.id}
              fontSize={'lg'}
              h={28}
              py={0}
              bg={tagColorFactory(t.type)}
              color="white"
              mr={4}
              mb={8}>
              {t.name}
            </Tag>
          ))}
        </Div>
        <Button
          w={'100%'}
          bg="pink600"
          onPress={() => onSubmit({word, selectedTags})}>
          検索
        </Button>
      </Div>
    </Overlay>
  );
};

export default SearchForm;
