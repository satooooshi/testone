import React from 'react';
import {Button, Div, DivProps, Tag} from 'react-native-magnus';
import {AllTag, TagType} from '../../types';
import {tagTypeNameFactory} from '../../utils/factory/tag/tagTypeNameFactory';
import {tagColorFactory} from '../../utils/factory/tagColorFactory';

type TagEditLineProps = DivProps & {
  onPressRightButton: () => void;
  tags: AllTag[];
  tagType: TagType;
};

const TagEditLine: React.FC<TagEditLineProps> = props => {
  const {onPressRightButton, tags, tagType} = props;

  return (
    <Div
      {...props}
      borderBottomWidth={1}
      flexDir="row"
      alignItems="flex-end"
      justifyContent="space-between">
      <Div w={'70%'} flexWrap="wrap" flexDir="row">
        {tags?.map(t => (
          <Tag
            px={'sm'}
            h={28}
            bg={tagColorFactory(tagType)}
            color="white"
            mr={4}
            mb={4}>
            {t.name}
          </Tag>
        ))}
      </Div>
      <Button
        px={'md'}
        alignSelf="flex-end"
        onPress={onPressRightButton}
        mb={4}
        fontWeight="bold"
        bg={tagColorFactory(tagType)}>
        {`${tagTypeNameFactory(tagType)}を編集`}
      </Button>
    </Div>
  );
};

export default TagEditLine;
