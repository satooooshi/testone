import {useNavigation, useRoute} from '@react-navigation/native';
import React, {useRef} from 'react';
import AppHeader from '../../../components/Header';
import WholeContainer from '../../../components/WholeContainer';
import {useAPICreateWiki} from '../../../hooks/api/wiki/useAPICreateWiki';
import {RuleCategory, Wiki, WikiType} from '../../../types';
import {
  PostWikiNavigationProps,
  PostWikiRouteProps,
} from '../../../types/navigator/screenProps/Wiki';
import {actions, RichEditor, RichToolbar} from 'react-native-pell-rich-editor';
import {ScrollView} from 'react-native';
import {Text} from 'react-native-magnus';

const PostWiki: React.FC = () => {
  const navigation = useNavigation<PostWikiNavigationProps>();
  const route = useRoute<PostWikiRouteProps>();
  const type = route.params?.type;
  const editorRef = useRef<RichEditor | null>(null);
  const {mutate: saveWiki} = useAPICreateWiki({
    onSuccess: () => {
      navigation.goBack();
    },
  });
  const initialValues: Partial<Wiki> = {
    title: '',
    body: '',
    tags: [],
    type: type || WikiType.QA,
    ruleCategory: type ? RuleCategory.RULES : undefined,
    textFormat: 'html',
  };
  // const {
  //   values: newWiki,
  //   setValues: setNewWiki,
  //   errors,
  //   touched,
  //   handleSubmit,
  // } = useFormik({
  //   enableReinitialize: true,
  //   initialValues,
  //   validationSchema: wikiSchema,
  //   onSubmit: (q) => {
  //     onClickSaveButton({
  //       ...q,
  //       body:
  //         q.textFormat === 'html'
  //           ? stateToHTML(editorState.getCurrentContent())
  //           : q.body,
  //     });
  //   },
  // });

  const editorInitializedCallback = () => {
    editorRef.current?.registerToolbar(function () {});
  };
  return (
    <WholeContainer>
      <AppHeader title="Wiki作成" />
      <RichToolbar
        editor={editorRef}
        selectedIconTint={'#2095F2'}
        disabledIconTint={'#bfbfbf'}
        actions={[
          actions.heading1,
          actions.heading2,
          actions.heading3,
          actions.heading4,
          actions.heading5,
          actions.heading6,
          'bold',
          actions.undo,
          actions.redo,
          actions.insertImage,
          actions.setStrikethrough,
          actions.insertOrderedList,
          actions.blockquote,
          actions.code,
        ]}
        iconMap={{
          [actions.heading1]: () => <Text>H1</Text>,
          [actions.heading2]: () => <Text>H2</Text>,
          [actions.heading3]: () => <Text>H3</Text>,
          [actions.heading4]: () => <Text>H4</Text>,
          [actions.heading5]: () => <Text>H5</Text>,
          [actions.heading6]: () => <Text>H6</Text>,
          [actions.bold]: () => <Text fontWeight="bold">B</Text>,
        }}
      />
      <ScrollView>
        <RichEditor
          ref={editorRef}
          initialHeight={250}
          useContainer={true}
          editorInitializedCallback={editorInitializedCallback}
        />
      </ScrollView>
    </WholeContainer>
  );
};

export default PostWiki;
