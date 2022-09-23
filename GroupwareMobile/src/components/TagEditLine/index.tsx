import React from 'react';
import {FlatList} from 'react-native';
import {Button, Div, DivProps, Icon, Tag, Text} from 'react-native-magnus';
import {AllTag, TagType} from '../../types';
import {tagTypeNameFactory} from '../../utils/factory/tag/tagTypeNameFactory';
import {tagBgColorFactory} from '../../utils/factory/tagBgColorFactory';
import {tagColorFactory} from '../../utils/factory/tagColorFactory';
import {tagFontColorFactory} from '../../utils/factory/tagFontColorFactory';

type TagEditLineProps = DivProps & {
  onPressRightButton: () => void;
  tags: AllTag[];
  tagType: TagType;
};

const TagEditLine: React.FC<TagEditLineProps> = props => {
  const {onPressRightButton, tags, tagType} = props;

  return (
    <>
      <Button
        bg="white"
        rounded="circle"
        color="blue700"
        fontSize={14}
        fontWeight="bold"
        borderWidth={1}
        borderColor="blue700"
        py="md"
        px="lg"
        mb="sm"
        onPress={onPressRightButton}
        prefix={
          <Icon
            name="add"
            fontSize={14}
            color="blue700"
            fontFamily="MaterialIcons"
          />
        }>
        タグを追加
      </Button>
      {tags && tags.length ? (
        <Div flexDir="row" alignItems="center" mb="sm">
          <Text fontSize={16} mr="sm">
            選択したタグ
          </Text>
          <FlatList
            horizontal
            data={tags}
            renderItem={({item: t}) => (
              <Tag
                key={t.id}
                px="lg"
                py="sm"
                bg={tagBgColorFactory(tagType)}
                color={tagFontColorFactory(tagType)}
                rounded="circle"
                mr={4}
                mb={4}>
                {t.name}
              </Tag>
            )}
          />
        </Div>
      ) : null}
    </>
  );
};

export default TagEditLine;
