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
import formToLinkTagStyles from '@/styles/components/FormToLinkTag.module.scss';
import { IoAddOutline } from 'react-icons/io5';
import { tagFontColorFactory } from 'src/utils/factory/tagFontColorFactory';
import { tagBgColorFactory } from 'src/utils/factory/tagBgColorFactory';

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
              <ButtonGroup isAttached size="xs">
                <Button
                  color={tagFontColorFactory(t.type)}
                  backgroundColor={tagBgColorFactory(t.type)}
                  mr="-10px"
                  size="sm"
                  rounded="full">
                  <Text fontWeight="normal">{t.name}</Text>
                </Button>
                <IconButton
                  color={tagFontColorFactory(t.type)}
                  backgroundColor={tagBgColorFactory(t.type)}
                  onClick={() => toggleTag(t)}
                  aria-label="削除"
                  icon={<MdCancel size={18} />}
                  size="sm"
                  rounded="full"
                />
              </ButtonGroup>
            </div>
          ))}
      </Box>
    </FormControl>
  );
};

export default FormToLinkTag;
