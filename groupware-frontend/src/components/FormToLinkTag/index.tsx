import { Box, Button, FormControl } from '@chakra-ui/react';
import React from 'react';
import { Tag, TagType } from 'src/types';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';
import { tagTypeNameFactory } from 'src/utils/factory/tagTypeNameFactory';

type FormToLinkTagProps = {
  tagType: TagType;
  tags: Tag[];
  onEditButtonClick: () => void;
};

const FormToLinkTag: React.FC<FormToLinkTagProps> = ({
  tagType,
  onEditButtonClick,
  tags,
}) => {
  return (
    <FormControl
      w={'100%'}
      display="flex"
      flexDir="row"
      justifyContent="flex-end"
      alignItems="flex-end"
      borderBottom="1px solid #b0b0b0">
      <Box w={'100%'} display="flex" flexDir="row" flexWrap="wrap">
        {tags
          .filter((t) => t.type === tagType)
          .map((t) => (
            <Button
              key={t.id}
              size="xs"
              colorScheme={tagColorFactory(t.type)}
              mb={2}
              mr={1}>
              {t.name}
            </Button>
          ))}
      </Box>
      <Button
        mb={2}
        size="sm"
        colorScheme={tagColorFactory(tagType)}
        onClick={onEditButtonClick}>{`${tagTypeNameFactory(
        tagType,
      )}を編集`}</Button>
    </FormControl>
  );
};

export default FormToLinkTag;
