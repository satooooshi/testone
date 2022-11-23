import React, { useEffect, useMemo, useState } from 'react';
import tagAdminStyles from '@/styles/layouts/admin/TagAdmin.module.scss';
import {
  Badge,
  Box,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { MdCancel } from 'react-icons/md';
import { Tag, TagType, UserTag } from 'src/types';
import { IoAddOutline } from 'react-icons/io5';
import { FiEdit2 } from 'react-icons/fi';
import { tagFontColorFactory } from 'src/utils/factory/tagFontColorFactory';
import { tagBgColorFactory } from 'src/utils/factory/tagBgColorFactory';

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
  const [isOpen, setModal] = useState(false);

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
    return !isVisibleAllTags && filteredTags?.length && filteredTags.length > 20
      ? filteredTags.slice(0, 20)
      : filteredTags;
  }, [filteredTags, isVisibleAllTags]);

  useEffect(() => {
    if (tagEditted) {
      setModal(true);
      setNewTagName(tagEditted.name);
      return;
    }
    setNewTagName('');
  }, [tagEditted]);

  return (
    <Box w="100%" mb={5}>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          setTagEditted(undefined);
          setNewTagName('');
          setModal(false);
        }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {tagEditted ? 'タグの編集' : '新規タグの追加'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              name="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="タグ名を入力"
            />
          </ModalBody>

          <ModalFooter>
            <Button
              mx="auto"
              colorScheme="brand"
              onClick={() => {
                if (tagEditted) {
                  onClickSaveButton({ ...tagEditted, name: newTagName });
                  setTagEditted(undefined);
                  setNewTagName('');
                  setIsVisibleAllTags(true);
                  setModal(false);
                  return;
                }
                onClickSaveButton({ name: newTagName, type: tagType });
                setNewTagName('');
                setIsVisibleAllTags(true);
                setModal(false);
              }}>
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Text
        fontWeight="bold"
        fontSize={20}
        mb={3}>{`${tagLabelName}タグ`}</Text>
      <Box bg="white" w="100%" display="flex" minH={100} p={5} rounded={10}>
        <Box w={40}>
          <Button
            mr="20px"
            px="24px"
            size="sm"
            onClick={() => setModal(true)}
            colorScheme="brand"
            variant="outline"
            rounded="full">
            <Box>
              <IoAddOutline size="20px" />
            </Box>
            <Text fontSize="14px">タグを追加</Text>
          </Button>
        </Box>
        <div className={tagAdminStyles.tags_wrapper}>
          {tagsDisplayed?.map((t) => (
            <div className={tagAdminStyles.tag_item_wrapper} key={t.id}>
              <Badge
                ml={2}
                p={2}
                key={t.id}
                display="flex"
                color={tagFontColorFactory(t.type)}
                backgroundColor={tagBgColorFactory(t.type)}
                borderRadius={50}
                alignItems="center"
                borderWidth={1}>
                {t.name}
                <Box ml={2}>
                  <FiEdit2
                    cursor="pointer"
                    size={14}
                    onClick={() => setTagEditted(t)}
                  />
                </Box>
                <Box ml={1}>
                  <MdCancel
                    cursor="pointer"
                    size={14}
                    onClick={() => onClickDeleteButton(t)}
                  />
                </Box>
              </Badge>
            </div>
          ))}
          {filteredTags?.length && filteredTags.length > 20 ? (
            <Button
              w={20}
              ml={3}
              onClick={() => setIsVisibleAllTags(!isVisibleAllTags)}
              size="sm"
              type="button"
              _focus={{ boxShadow: 'none' }}
              isFullWidth={true}
              colorScheme="blackAlpha">
              {!isVisibleAllTags ? '全て表示' : '折りたたむ'}
            </Button>
          ) : null}
        </div>
      </Box>
    </Box>
  );
};

export default TagListBox;
