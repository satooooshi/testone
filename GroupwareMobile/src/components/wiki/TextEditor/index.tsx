import React, {useCallback, useRef} from 'react';
import {useWindowDimensions} from 'react-native';
import {Div, Text} from 'react-native-magnus';
import {RichToolbar, actions, RichEditor} from 'react-native-pell-rich-editor';
import {textEditorStyles} from '../../../styles/component/wiki/textEditor.style';
import {TextFormat} from '../../../types';
import MarkdownIt from 'markdown-it';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

type TextEditorProps = {
  textFormat?: TextFormat;
  onUploadImage: (onSuccess: (imageURL: string[]) => void) => void;
  initialBody?: string;
  onChange: (text: string) => void;
  scrollRef?: React.MutableRefObject<KeyboardAwareScrollView | null>;
};

const TextEditor: React.FC<TextEditorProps> = ({
  textFormat,
  onUploadImage,
  initialBody,
  onChange,
  scrollRef,
}) => {
  const markdownit = new MarkdownIt();
  const editorRef = useRef<RichEditor | null>(null);
  const {height: windowHeight} = useWindowDimensions();
  const editorInitializedCallback = useCallback(() => {
    editorRef.current?.registerToolbar(function () {});
  }, [editorRef]);
  return (
    <Div mb={16}>
      {textFormat === 'html' ? (
        <>
          <RichEditor
            placeholder="本文を入力してください"
            ref={editorRef}
            style={{
              ...textEditorStyles.richEditor,
              height: windowHeight * 0.6,
            }}
            initialHeight={300}
            initialContentHTML={initialBody}
            useContainer={true}
            scrollEnabled={true}
            editorInitializedCallback={editorInitializedCallback}
            onChange={onChange}
          />
          <RichToolbar
            editor={editorRef}
            selectedIconTint={'#2095F2'}
            onPressAddImage={() => {
              if (editorRef.current) {
                onUploadImage(imageUrl =>
                  //@ts-ignore If write this like editorRef.current?.insertImage it doesn't work on initial uploading.
                  {
                    editorRef.current?.insertImage(imageUrl[0]);
                  },
                );
              }
            }}
            disabledIconTint={'#bfbfbf'}
            actions={[
              actions.heading1,
              actions.heading2,
              actions.heading3,
              actions.heading4,
              actions.heading5,
              actions.heading6,
              'bold',
              actions.setStrikethrough,
              // actions.insertOrderedList,
              actions.blockquote,
              actions.code,
              actions.insertImage,
              actions.undo,
              actions.redo,
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
        </>
      ) : textFormat === 'markdown' ? (
        <>
          <RichToolbar
            editor={editorRef}
            selectedIconTint={'#2095F2'}
            onPressAddImage={() => {
              if (editorRef.current) {
                onUploadImage(imageUrl =>
                  //@ts-ignore If write this like editorRef.current?.insertImage it doesn't work on initial uploading.
                  editorRef.current.insertImage(imageUrl[0]),
                );
              }
            }}
            disabledIconTint={'#bfbfbf'}
            actions={[
              actions.heading1,
              actions.heading2,
              actions.heading3,
              actions.heading4,
              actions.heading5,
              actions.heading6,
              'bold',
              actions.setStrikethrough,
              // actions.insertOrderedList,
              actions.blockquote,
              actions.code,
              actions.insertImage,
              actions.undo,
              actions.redo,
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
          <RichEditor
            placeholder="本文を入力してください"
            ref={editorRef}
            style={{
              ...textEditorStyles.richEditor,
              height: windowHeight * 0.6,
            }}
            initialHeight={400}
            initialContentHTML={markdownit.render(initialBody || '')}
            useContainer={true}
            scrollEnabled={true}
            editorInitializedCallback={editorInitializedCallback}
            onCursorPosition={scrollY =>
              scrollRef?.current?.scrollTo({y: scrollY - 30, animated: true})
            }
            onChange={onChange}
          />
        </>
      ) : null}
    </Div>
  );
};

export default TextEditor;
