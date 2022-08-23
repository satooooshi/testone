import React from 'react';
import {Div, DivProps, Tag as TagButton, Text} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import {TagType, UserTag} from '../../../types';
import {darkFontColor} from '../../../utils/colors';
import {tagTypeNameFactory} from '../../../utils/factory/tag/tagTypeNameFactory';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
import AutoLinkedText from '../../common/AutoLinkedText';

type TagListBoxProps = DivProps & {
  tags: UserTag[];
  tagType: TagType;
  introduce: string;
};

const TagListBox: React.FC<TagListBoxProps> = props => {
  const {tags, tagType, introduce} = props;
  return (
    <Div {...props} bg="white" rounded={'md'}>
      <Text fontSize={16} mb={'sm'}>
        {`${tagTypeNameFactory(tagType)}タグ`}
      </Text>
      <Div flexDir="row" flexWrap="wrap" mb={'md'}>
        {tags?.map(t => (
          <TagButton
            key={t.id}
            mb={8}
            color="white"
            bg={tagColorFactory(t.type)}>
            {t.name}
          </TagButton>
        ))}
      </Div>
      <AutoLinkedText
        text={introduce || '未設定'}
        style={tailwind('text-base font-bold')}
        linkStyle={tailwind('text-blue-500 text-base text-base')}
      />
    </Div>
  );
};

export default TagListBox;
