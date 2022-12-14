import React, {useCallback, useEffect, useState} from 'react';
import {useGetTagsBySearchTarget} from '../../../hooks/tag/useGetTagsBySearchTarget';
import {
  Button,
  Div,
  Icon,
  Input,
  Overlay,
  ScrollDiv,
  Tag,
} from 'react-native-magnus';
import {useSelectedTags} from '../../../hooks/tag/useSelectedTags';
import {useTagType} from '../../../hooks/tag/useTagType';
import {AllTag} from '../../../types';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
import TagModal from '../TagModal';
import tailwind from 'tailwind-rn';
import {useFocusEffect} from '@react-navigation/native';

export type SearchFormValue = {
  word: string;
  selectedTags: AllTag[];
};

export type SearchTarget = 'user' | 'other';

type SearchFormProps = {
  searchTarget: SearchTarget;
  defaultValue?: SearchFormValue;
  isVisible: boolean;
  onClear: () => void;
  onCloseModal: () => void;
  onSubmit: (value: SearchFormValue) => void;
  defaultSelectedTagIds?: number[];
};

const SearchForm: React.FC<SearchFormProps> = ({
  searchTarget,
  defaultValue,
  isVisible,
  onClear,
  onCloseModal,
  onSubmit,
  defaultSelectedTagIds = [],
}) => {
  const {data: tags, refetch} = useGetTagsBySearchTarget(searchTarget)();
  const [word, setWord] = useState(defaultValue?.word || '');
  const [visibleTagModal, setVisibleTagModal] = useState(false);
  const {selectedTags, setSelectedTags} = useSelectedTags(
    defaultValue?.selectedTags,
  );
  const {selectedTagType} = useTagType('All', tags);

  useEffect(() => {
    if (defaultSelectedTagIds.length && !selectedTags.length) {
      const def = (tags as AllTag[])?.filter(t =>
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

  const handleOnClear = () => {
    setWord('');
    setSelectedTags([]);
    onClear();
  };
  useFocusEffect(
    useCallback(() => {
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  return (
    <Overlay px={16} py={32} style={{maxHeight: '80%'}} visible={isVisible}>
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
        onCompleteModal={selectedTagsInModal =>
          setSelectedTags(selectedTagsInModal)
        }
        isVisible={visibleTagModal}
        onCloseModal={() => setVisibleTagModal(false)}
        tags={tags || []}
        selectedTagType={selectedTagType}
        defaultSelectedTags={selectedTags}
      />
      <Div maxH={'100%'}>
        <Input
          placeholder="??????????????????????????????????????????"
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
            ? `${selectedTags.length}???????????????????????????`
            : '???????????????'}
        </Button>
        <ScrollDiv
          style={{maxHeight: '80%'}}
          contentContainerStyle={tailwind('flex-row flex-wrap ')}>
          {selectedTags.map(t => (
            <Tag
              key={t.id}
              fontSize={'lg'}
              py={0}
              bg={tagColorFactory((t as AllTag).type)}
              color="white"
              mr={4}
              mb={8}>
              {t.name}
            </Tag>
          ))}
        </ScrollDiv>
        <Button
          w={'100%'}
          bg="pink600"
          mb={8}
          onPress={() =>
            onSubmit({word, selectedTags: selectedTags as AllTag[]})
          }>
          ??????
        </Button>
        <Button w={'100%'} bg="gray" onPress={handleOnClear}>
          ?????????
        </Button>
      </Div>
    </Overlay>
  );
};

export default SearchForm;
