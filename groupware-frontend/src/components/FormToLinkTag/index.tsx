import {
  Badge,
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
            <Badge
              ml={2}
              p={2}
              key={t.id}
              display="flex"
              color={tagFontColorFactory(t.type)}
              backgroundColor={tagBgColorFactory(t.type)}
              borderRadius={50}
              alignItems="center">
              {t.name}
              <Box ml={1} cursor="pointer">
                <MdCancel size={14} onClick={() => toggleTag(t)} />
              </Box>
            </Badge>
          ))}
      </Box>
    </FormControl>
  );
};

export default FormToLinkTag;
