import React from 'react';
import {Div, DivProps, Tag as TagButton, Text} from 'react-native-magnus';
import tailwind from 'tailwind-rn';
import {TagType, UserTag} from '../../../types';
import {darkFontColor} from '../../../utils/colors';
import {tagTypeNameFactory} from '../../../utils/factory/tag/tagTypeNameFactory';
import {tagBgColorFactory} from '../../../utils/factory/tagBgColorFactory';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';
import {tagFontColorFactory} from '../../../utils/factory/tagFontColorFactory';
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
      <Text fontSize={16} mb={'sm'} fontWeight="bold">
        {`${tagTypeNameFactory(tagType)}タグ`}
      </Text>
      <Div flexDir="row" flexWrap="wrap">
        {tags?.length ? (
          tags?.map(t => (
            <TagButton key={t.id} mb={6} mr={6} bg={tagBgColorFactory(t.type)}>
              <Text fontSize={12} color={tagFontColorFactory(t.type)}>
                {t.name}
              </Text>
            </TagButton>
          ))
        ) : (
          <TagButton mb={6} mr={6} bg={tagBgColorFactory(tagType)}>
            <Text fontSize={12} color={tagFontColorFactory(tagType)}>
              未設定
            </Text>
          </TagButton>
        )}
      </Div>
      {introduce ? (
        <AutoLinkedText
          text={introduce || '未設定'}
          style={tailwind('text-base')}
          linkStyle={tailwind('text-blue-500 text-base text-base')}
        />
      ) : null}
    </Div>
  );
};

export default TagListBox;
