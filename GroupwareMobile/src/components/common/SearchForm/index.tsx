import React, {useState} from 'react';
import {FlatList} from 'react-native';
import {
  Button,
  Div,
  Icon,
  Input,
  Modal,
  Overlay,
  Tag,
} from 'react-native-magnus';
import {useSelectedTags} from '../../../hooks/tag/useSelectedTags';
import {useTagType} from '../../../hooks/tag/useTagType';
import {searchFormStyles} from '../../../styles/component/common/searchFormModal.style';
import {AllTag} from '../../../types';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
import TagModal from '../TagModal';

export type SearchFormValue = {
  word: string;
  selectedTags: AllTag[];
};

type SearchFormProps = {
  defaultValue?: SearchFormValue;
  isVisible: boolean;
  onCloseModal: () => void;
  tags: AllTag[];
  onSubmit: (value: SearchFormValue) => void;
};

const SearchForm: React.FC<SearchFormProps> = ({
  defaultValue,
  isVisible,
  onCloseModal,
  tags,
  onSubmit,
}) => {
  const [word, setWord] = useState(defaultValue?.word || '');
  const [visibleTagModal, setVisibleTagModal] = useState(false);
  const {selectedTags, toggleTag, isSelected} = useSelectedTags(
    defaultValue?.selectedTags,
  );
  const {selectedTagType, selectTagType, filteredTags} = useTagType(
    'All',
    tags,
  );
  return (
    <Modal
      px={16}
      py={32}
      h={240 + selectedTags.length * 8}
      isVisible={isVisible}>
      <Button
        bg="gray400"
        h={35}
        w={35}
        position="absolute"
        right={-15}
        top={-45}
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
    </Modal>
  );
};

export default SearchForm;
