import React, {useCallback, useRef, useState} from 'react';
import {useWindowDimensions} from 'react-native';
import {Div} from 'react-native-magnus';
import {RichEditor} from 'react-native-pell-rich-editor';
import {textEditorStyles} from '../../../styles/component/wiki/textEditor.style';
import {TextFormat} from '../../../types';
import MarkdownIt from 'markdown-it';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import QuillEditor, {QuillToolbar} from 'react-native-cn-quill';
import {blueColor} from '../../../utils/colors';

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
  // scrollRef,
}) => {
  const markdownit = new MarkdownIt();
  const quillRef = useRef<QuillEditor | null>(null);
  const [height, setHeight] = useState<number>(100);
  // const editorRef = useRef<RichEditor | null>(null);
  // const {height: windowHeight} = useWindowDimensions();
  // const editorInitializedCallback = useCallback(() => {
  //     editorRef.current?.registerToolbar(function () {});
  //     }, [editorRef]);

  const customHandler = (name: string) => {
    if (name === 'image') {
      onUploadImage(async imageURL => {
        const range = await quillRef.current?.getSelection();
        quillRef.current?.insertEmbed(range.index, 'image', imageURL[0]);
      });
    }
  };

  return (
    <Div>
      <QuillEditor
        ref={quillRef}
        initialHtml={
          textFormat === 'markdown' && initialBody
            ? markdownit.render(initialBody)
            : textFormat === 'html' && initialBody
            ? initialBody
            : undefined
        }
        style={{...textEditorStyles.quillEditor, height}}
        quill={{
          // not required just for to show how to pass this props
          placeholder: '本文を入力',
          modules: {
            toolbar: false, // this is default value
          },
          theme: 'snow', // this is default value
        }}
        onHtmlChange={({html}) => onChange(html)}
        onDimensionsChange={({height: changedHeight}) =>
          setHeight(changedHeight)
        }
      />
      <QuillToolbar
        editor={quillRef}
        options={[
          ['bold', 'italic', 'underline'],
          ['blockquote'],
          [{list: 'ordered'}, {list: 'bullet'}],

          [{header: 1}, {header: 2}, {header: 3}],
          ['image', 'clock'],
        ]}
        theme="light"
        styles={{
          toolbar: {
            provider: provided => ({
              ...provided,
              borderTopWidth: 0,
            }),
            root: provided => ({
              ...provided,
              backgroundColor: blueColor,
            }),
          },
        }}
        custom={{
          handler: customHandler,
          actions: ['image'],
        }}
      />
    </Div>
  );
};

export default TextEditor;
