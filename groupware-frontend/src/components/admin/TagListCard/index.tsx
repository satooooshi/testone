import React, { useEffect, useMemo, useState } from 'react';
import tagAdminStyles from '@/styles/layouts/admin/TagAdmin.module.scss';
import { Button, ButtonGroup, IconButton, Input } from '@chakra-ui/react';
import { HiPencilAlt } from 'react-icons/hi';
import { MdCancel } from 'react-icons/md';
import { Tag, TagType, UserTag } from 'src/types';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';

type TagListBoxProps = {
  tagType: TagType;
  tags?: (Tag | UserTag)[];
  onClickSaveButton: (t: Partial<Tag | UserTag>) => void;
  onClickDeleteButton: (t: Tag | UserTag) => void;
};

const TagListBox: React.FC<TagListBoxProps> = ({
  tagType,
  tags,
  onClickSaveButton,
  onClickDeleteButton,
}) => {
  const [newTagName, setNewTagName] = useState('');
  const [tagEditted, setTagEditted] = useState<Tag>();
  const [isVisibleAllTags, setIsVisibleAllTags] = useState(false);

  const tagLabelName = useMemo(() => {
    switch (tagType) {
      case TagType.TECH:
        return '技術';
      case TagType.QUALIFICATION:
        return '資格';
      case TagType.CLUB:
        return '部活動';
      case TagType.HOBBY:
        return '趣味';
      case TagType.OTHER:
        return 'その他';
    }
  }, [tagType]);

  const filteredTags = useMemo(() => {
    return tags?.filter((t) => t.type === tagType);
  }, [tagType, tags]);

  const tagsDisplayed = useMemo(() => {
    return !isVisibleAllTags && filteredTags?.length && filteredTags.length > 4
      ? filteredTags.slice(0, 4)
      : filteredTags;
  }, [filteredTags, isVisibleAllTags]);

  useEffect(() => {
    if (tagEditted) {
      setNewTagName(tagEditted.name);
      return;
    }
    setNewTagName('');
  }, [tagEditted]);

  return (
    <div className={tagAdminStyles.tag_list_area}>
      <div className={tagAdminStyles.tag_label_wrapper}>
        <p className={tagAdminStyles.tag_label_text}>{`${tagLabelName}タグ`}</p>
      </div>
      <div className={tagAdminStyles.tag_form_wrapper}>
        {tagEditted && (
          <div className={tagAdminStyles.selected_tag_wrapper}>
            <Button colorScheme={tagColorFactory(tagEditted.type)} size="sm">
              {tagEditted.name}
            </Button>
            <p className={tagAdminStyles.right_arrow}>を編集</p>
          </div>
        )}
        <div className={tagAdminStyles.input_and_button_wrapper}>
          <div className={tagAdminStyles.tag_input_wrapper}>
            <Input
              name="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="タグ名を入力"
            />
          </div>
          <div className={tagAdminStyles.buttons_wrapper}>
            <div className={tagAdminStyles.save_button_wrapper}>
              <Button
                onClick={() => {
                  if (tagEditted) {
                    onClickSaveButton({ ...tagEditted, name: newTagName });
                    setTagEditted(undefined);
                    setNewTagName('');
                    setIsVisibleAllTags(true);
                    return;
                  }
                  onClickSaveButton({ name: newTagName, type: tagType });
                  setNewTagName('');
                  setIsVisibleAllTags(true);
                }}
                size="sm"
                colorScheme="green"
                variant="outline">
                {!tagEditted ? '新規追加' : '保存'}
              </Button>
            </div>
            {tagEditted && (
              <Button
                onClick={() => {
                  setTagEditted(undefined);
                }}
                size="sm"
                colorScheme="blue"
                variant="outline">
                キャンセル
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className={tagAdminStyles.tags_wrapper}>
        {tagsDisplayed?.map((t) => (
          <div className={tagAdminStyles.tag_item_wrapper} key={t.id}>
            <ButtonGroup
              isAttached
              size="sm"
              colorScheme={tagColorFactory(t.type)}>
              <Button mr="-px">{t.name}</Button>
              <IconButton
                aria-label="編集"
                icon={<HiPencilAlt size={18} />}
                onClick={() => setTagEditted(t)}
              />
              <IconButton
                onClick={() => onClickDeleteButton(t)}
                aria-label="削除"
                icon={<MdCancel size={18} />}
              />
            </ButtonGroup>
          </div>
        ))}
      </div>
      {filteredTags?.length && filteredTags.length > 4 ? (
        <Button
          onClick={() => setIsVisibleAllTags(!isVisibleAllTags)}
          size="md"
          type="button"
          _focus={{ boxShadow: 'none' }}
          isFullWidth={true}
          colorScheme="blackAlpha">
          {!isVisibleAllTags ? '全て表示' : '折りたたむ'}
        </Button>
      ) : null}
    </div>
  );
};

export default TagListBox;
