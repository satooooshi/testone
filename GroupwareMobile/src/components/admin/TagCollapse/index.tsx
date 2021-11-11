import React, {useState} from 'react';
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
import {tagTypeNameFactory} from '../../../utils/factory/tag/tagTypeNameFactory';
import {tagColorFactory} from '../../../utils/factory/tagColorFactory';

type TagCollapseProps = CollapseProps & {
  tags: AllTag[];
  tagType: TagType;
  onPressSaveButton: (t: Partial<AllTag>) => void;
  onLongPressTag: (t: AllTag) => void;
};

const TagCollapse: React.FC<TagCollapseProps> = ({
  tags,
  tagType,
  onPressSaveButton,
  onLongPressTag,
}) => {
  const [newTagName, setNewTagName] = useState('');
  const [tagEditted, setTagEditted] = useState<AllTag>();
  return (
    <Collapse>
      <Collapse.Header
        active
        color="white"
        bg={tagColorFactory(tagType)}
        fontSize={18}
        fontWeight={'bold'}
        suffix={
          <Icon
            position="absolute"
            right={8}
            name="down"
            fontSize={20}
            color="white"
          />
        }
        activeSuffix={
          <Icon
            position="absolute"
            right={8}
            name="up"
            fontSize={20}
            color="white"
          />
        }
        p="md"
        px="none">
        {`${tagTypeNameFactory(tagType)}タグ`}
      </Collapse.Header>
      <Collapse.Body
        pb="xl"
        rounded="md"
        bg="white"
        flexDir="row"
        flexWrap="wrap">
        <Input
          autoCapitalize="none"
          value={newTagName}
          onChangeText={t => setNewTagName(t)}
          placeholder="タグ名を入力してください"
          w="100%"
          mb={'lg'}
        />
        {tagEditted ? (
          <Div flexDir="row" mb="lg" justifyContent="space-evenly" w="100%">
            <Button
              w={'45%'}
              bg={'white'}
              color="green700"
              borderColor="green700"
              onPress={() =>
                onPressSaveButton({
                  ...tagEditted,
                  name: newTagName,
                  type: tagEditted.type,
                })
              }
              borderWidth={1}>
              保存
            </Button>
            <Button
              w={'45%'}
              bg={'white'}
              color="blue700"
              borderColor="blue700"
              borderWidth={1}
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
            bg={'white'}
            color="green700"
            borderColor="green700"
            onPress={() => onPressSaveButton({name: newTagName, type: tagType})}
            borderWidth={1}>
            新規追加
          </Button>
        )}
        {tags.map(t => (
          <TagButton
            onLongPress={() => onLongPressTag(t)}
            key={t.id}
            onPress={() => {
              setNewTagName(t.name);
              setTagEditted(t);
            }}
            bg={tagColorFactory(t.type)}
            color="white"
            mr={4}
            mb={4}>
            {t.name}
          </TagButton>
        ))}
      </Collapse.Body>
    </Collapse>
  );
};

export default TagCollapse;
