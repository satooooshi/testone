import React, {useState} from 'react';
import {TouchableHighlight} from 'react-native';
import {
  Button,
  Collapse,
  CollapseProps,
  Div,
  Icon,
  Input,
  Tag as TagButton,
} from 'react-native-magnus';
import {AllTag, TagType} from '../../../types';
import {layoutBackgroundGrayColor} from '../../../utils/colors';
import {tagTypeNameFactory} from '../../../utils/factory/tag/tagTypeNameFactory';
import {tagBgColorFactory} from '../../../utils/factory/tagBgColorFactory';
import {tagFontColorFactory} from '../../../utils/factory/tagFontColorFactory';

type TagCollapseProps = CollapseProps & {
  tags: AllTag[];
  tagType: TagType;
  onPressSaveButton: (t: Partial<AllTag>) => void;
  onPressDeleteTag: (t: AllTag) => void;
};

const TagCollapse: React.FC<TagCollapseProps> = ({
  tags,
  tagType,
  onPressSaveButton,
  onPressDeleteTag,
}) => {
  const [newTagName, setNewTagName] = useState('');
  const [tagEditted, setTagEditted] = useState<AllTag>();
  return (
    <Collapse>
      <Collapse.Header
        active
        color="black"
        bg={layoutBackgroundGrayColor}
        fontSize={18}
        fontWeight={'bold'}
        borderBottomWidth={0.2}
        borderBottomColor="gray"
        suffix={
          <Icon
            position="absolute"
            right={8}
            name="down"
            fontSize={20}
            color="black"
          />
        }
        activeSuffix={
          <Icon
            position="absolute"
            right={8}
            name="up"
            fontSize={20}
            color="black"
          />
        }
        p="md"
        px="none">
        {`${tagTypeNameFactory(tagType)}タグ`}
      </Collapse.Header>
      <Collapse.Body
        pb="xl"
        rounded="md"
        bg={layoutBackgroundGrayColor}
        flexDir="row"
        flexWrap="wrap">
        <Input
          autoCapitalize="none"
          value={newTagName}
          onChangeText={t => setNewTagName(t)}
          placeholder="タグ名を入力してください"
          fontSize="lg"
          w="100%"
          borderWidth={0}
          mb={'lg'}
        />
        {tagEditted ? (
          <Div flexDir="row" mb="lg" justifyContent="space-evenly" w="100%">
            <Button
              w={'45%'}
              bg="blue700"
              color="white"
              rounded="lg"
              onPress={() => {
                onPressSaveButton({
                  ...tagEditted,
                  name: newTagName,
                  type: tagEditted.type,
                });
                setNewTagName('');
                setTagEditted(undefined);
              }}>
              変更する
            </Button>
            <Button
              w="45%"
              bg={layoutBackgroundGrayColor}
              color="gray"
              borderWidth={1}
              borderColor="gray"
              rounded="lg"
              onPress={() => {
                setTagEditted(undefined);
                setNewTagName('');
              }}>
              キャンセル
            </Button>
          </Div>
        ) : (
          <Button
            w="100%"
            mb="lg"
            bg="blue700"
            color="white"
            rounded="lg"
            onPress={() => {
              onPressSaveButton({name: newTagName, type: tagType});
              setNewTagName('');
            }}>
            追加する
          </Button>
        )}
        {tags.map(t => (
          <TagButton
            key={t.id}
            onPress={() => {
              setNewTagName(t.name);
              setTagEditted(t);
            }}
            bg={tagBgColorFactory(t.type)}
            color={tagFontColorFactory(t.type)}
            mr={4}
            suffix={
              <TouchableHighlight onPress={() => onPressDeleteTag(t)}>
                <Icon
                  name="cross"
                  fontSize="xl"
                  color={tagFontColorFactory(t.type)}
                  fontFamily="Entypo"
                />
              </TouchableHighlight>
            }
            mb={4}>
            {t.name}
          </TagButton>
        ))}
      </Collapse.Body>
    </Collapse>
  );
};

export default TagCollapse;
