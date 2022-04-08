import {
  Box,
  Button,
  ButtonGroup,
  FormControl,
  IconButton,
} from '@chakra-ui/react';
import React from 'react';
import { MdCancel } from 'react-icons/md';
import { Tag, TagType } from 'src/types';
import { tagColorFactory } from 'src/utils/factory/tagColorFactory';
import { tagTypeNameFactory } from 'src/utils/factory/tagTypeNameFactory';
import formToLinkTagStyles from '@/styles/components/FormToLinkTag.module.scss';

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
