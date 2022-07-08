import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  IconButton,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import { MdCancel } from 'react-icons/md';
import { Tag, TagType } from 'src/types';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';
import { tagTypeNameFactory } from 'src/utils/factory/tagTypeNameFactory';
import formToLinkTagStyles from '@/styles/components/FormToLinkTag.module.scss';
import { IoAddOutline } from 'react-icons/io5';

type FormToLinkTagProps = {
  tagType: TagType;
  tags: Tag[];
  toggleTag: (t: Tag) => void;
  onEditButtonClick: () => void;
};

const FormToLinkTag: React.FC<FormToLinkTagProps> = ({
  tagType,
  onEditButtonClick,
  toggleTag,
  tags,
}) => {
  return (
    <FormControl w={'100%'} display="flex" flexDir="row" mb="14px">
      <Button
        mr="20px"
        px="24px"
        size="sm"
        onClick={onEditButtonClick}
        colorScheme="blue"
        variant="outline"
        rounded="full">
        <Box>
          <IoAddOutline size="20px" />
        </Box>
        <Text fontSize="14px">タグを追加</Text>
      </Button>

      <Box
        w="100%"
        display="flex"
        flexDir="row"
        flexWrap="wrap"
        lineHeight="28px"
        alignItems="center">
        <Text fontSize="14px" mr="10px">
          選択したタグ
        </Text>
        {tags
          .filter((t) => t.type === tagType)
          .map((t) => (
            <div
              className={formToLinkTagStyles.selected_tags_wrapper}
              key={t.id}>
              <ButtonGroup
                isAttached
                size="xs"
                colorScheme={tagColorFactory(t.type)}>
                <Button mr="-px">{t.name}</Button>
                <IconButton
                  onClick={() => toggleTag(t)}
                  aria-label="削除"
                  icon={<MdCancel size={18} />}
                />
              </ButtonGroup>
            </div>
          ))}
      </Box>
    </FormControl>
  );
};

export default FormToLinkTag;
