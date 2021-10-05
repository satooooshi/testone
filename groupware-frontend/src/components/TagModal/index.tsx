import React, { useEffect, useState } from 'react';
import { Tag, TagType, UserTag } from 'src/types';
import Modal from 'react-modal';
import tagModalStyles from '@/styles/components/TagModal.module.scss';
import { useAPICreateTag } from '@/hooks/api/tag/useAPICreateTag';
import clsx from 'clsx';
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useMediaQuery,
} from '@chakra-ui/react';

type TagModalProps = {
  isOpen: boolean;
  isSearch?: boolean;
  tags: (Tag | UserTag)[];
  selectedTags: (Tag | UserTag)[];
  filteredTagType?: TagType;
  toggleTag: (t: Tag) => void;
  onCancel: () => void;
  onComplete: () => void;
};

type TagListItemProps = {
  tag: Tag;
  toggleTag: (t: Tag) => void;
  selectedTags: Tag[];
};

const TagListItem: React.FC<TagListItemProps> = ({
  tag,
  toggleTag,
  selectedTags,
}) => {
  return (
    <a
      onClick={(e) => {
        e.stopPropagation();
        toggleTag(tag);
      }}
      className={clsx(
        tagModalStyles.tag__item,
        !!selectedTags.filter((s) => s.id === tag.id).length &&
          tagModalStyles.tag__item__selected,
      )}>
      <div className={tagModalStyles.tag__item_left}>
        <p className={tagModalStyles.tag__name}>{tag.name}</p>
      </div>
    </a>
  );
};
const TagModal: React.FC<TagModalProps> = ({
  isOpen,
  isSearch,
  tags: savedTags,
  selectedTags,
  filteredTagType,
  toggleTag,
  onCancel: closeTagModal,
  onComplete,
}) => {
  const [newTag, setNewTag] = useState<Partial<Tag>>({
    name: '',
  });
  const [tags, setTags] = useState(savedTags);
  const [isLargerThan768] = useMediaQuery('(max-width: 768px)');
  const [selectedTagType, setSelectedTagType] = useState<TagType | 'all'>(
    'all',
  );

  const { mutate: createTag } = useAPICreateTag({
    onSuccess: (newTag) => {
      setNewTag((t) => ({ ...t, name: '' }));
      setTags((t) => (t ? [newTag, ...t] : [newTag]));
    },
  });

  const checkAndCreateTag = () => {
    !tags.find((tag) => tag.name === newTag.name) && createTag(newTag);
  };

  useEffect(() => {
    if (savedTags) {
      setTags(savedTags);
    }
  }, [savedTags]);

  useEffect(() => {
    if (filteredTagType) {
      setSelectedTagType(filteredTagType);
    }
  }, [filteredTagType]);

  return (
    <Modal
      ariaHideApp={false}
      shouldCloseOnOverlayClick={true}
      shouldCloseOnEsc={true}
      isOpen={isOpen}
      style={{ overlay: { zIndex: 110 } }}
      className={tagModalStyles.modal_wrapper}>
      {tags.find((tag) => tag.name === newTag.name) ? (
        <p className={tagModalStyles.error_text}>すでに作成してあります</p>
      ) : null}
      {!isSearch && (
        <div className={tagModalStyles.modal_input_wrapper}>
          <Input
            type="text"
            className={tagModalStyles.modal_input_name}
            width={isLargerThan768 ? '100%' : '75%'}
            value={newTag.name}
            background="white"
            onChange={(e) => setNewTag((t) => ({ ...t, name: e.target.value }))}
            placeholder="タグ名を入力して新規タグを作成"
          />
          <Button
            colorScheme="green"
            width={isLargerThan768 ? '100%' : '20%'}
            className={tagModalStyles.create_button}
            onClick={checkAndCreateTag}>
            作成
          </Button>
        </div>
      )}
      {!filteredTagType && (
        <FormControl className={tagModalStyles.tag_select_wrapper}>
          <FormLabel>タイプ</FormLabel>
          <Select
            bg="white"
            onChange={(e) =>
              setSelectedTagType(e.target.value as TagType | 'all')
            }
            defaultValue={selectedTagType}>
            <option value={'all'}>全て</option>
            <option value={TagType.TECH}>技術</option>
            <option value={TagType.CLUB}>部活動</option>
            <option value={TagType.QUALIFICATION}>資格</option>
            <option value={TagType.HOBBY}>趣味</option>
            <option value={TagType.OTHER}>その他</option>
          </Select>
        </FormControl>
      )}
      <div className={tagModalStyles.tags}>
        {selectedTagType === 'all'
          ? tags?.map((t) => (
              <TagListItem
                key={t.id}
                tag={t}
                toggleTag={toggleTag}
                selectedTags={selectedTags}
              />
            ))
          : tags?.map(
              (t) =>
                t.type === selectedTagType && (
                  <TagListItem
                    key={t.id}
                    tag={t}
                    toggleTag={toggleTag}
                    selectedTags={selectedTags}
                  />
                ),
            )}
      </div>
      <div className={tagModalStyles.modal_bottom_buttons}>
        <Button
          size="md"
          width="140px"
          colorScheme="blue"
          borderRadius={5}
          className={tagModalStyles.modal_cancel_button}
          onClick={closeTagModal}>
          キャンセル
        </Button>
        <Button
          size="md"
          width="140px"
          colorScheme="green"
          borderRadius={5}
          onClick={onComplete}>
          タグを選択
        </Button>
      </div>
    </Modal>
  );
};

export default TagModal;
