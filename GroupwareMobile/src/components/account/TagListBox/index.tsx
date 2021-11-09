import React from 'react';
import {Div, DivProps, Tag as TagButton, Text} from 'react-native-magnus';
import {TagType, UserTag} from '../../../types';
import {darkFontColor} from '../../../utils/colors';
import {tagTypeNameFactory} from '../../../utils/factory/tag/tagTypeNameFactory';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';

type TagListBoxProps = DivProps & {
  tags: UserTag[];
  tagType: TagType;
  introduce: string;
};

const TagListBox: React.FC<TagListBoxProps> = props => {
  const {tags, tagType, introduce} = props;
  return (
    <Div {...props} bg="white" p={'lg'} rounded={'md'}>
      <Div flexDir="row" flexWrap="wrap" mb={'md'}>
        {tags?.map(t => (
          <TagButton
            key={t.id}
            mr={4}
            mb={8}
            color="white"
            bg={tagColorFactory(t.type)}>
            {t.name}
          </TagButton>
        ))}
      </Div>
      <Div>
        <Text fontSize={16} mb={'sm'}>
          {`${tagTypeNameFactory(tagType)}の紹介`}
        </Text>
        <Text fontSize={16} fontWeight="bold" color={darkFontColor}>
          {introduce || '未設定'}
        </Text>
      </Div>
    </Div>
  );
};

export default TagListBox;
