import React, {useRef, useState} from 'react';
import {textEditorStyles} from '../../../styles/component/wiki/textEditor.style';
import {TextFormat} from '../../../types';
import MarkdownIt from 'markdown-it';
import QuillEditor, {QuillToolbar} from 'react-native-cn-quill';
import {blueColor} from '../../../utils/colors';

type TextEditorProps = {
  textFormat?: TextFormat;
  onUploadImage: (onSuccess: (imageURL: string[]) => void) => void;
  initialBody?: string;
  onChange: (text: string) => void;
};

const TextEditor: React.FC<TextEditorProps> = ({
  textFormat,
  onUploadImage,
  initialBody,
  onChange,
}) => {
  const [height, setHeight] = useState<number>(200);
  const markdownit = new MarkdownIt();
  const quillRef = useRef<QuillEditor | null>(null);

  const customHandler = (name: string) => {
    if (name === 'image') {
      onUploadImage(async imageURL => {
        const range = await quillRef.current?.getSelection();
        quillRef.current?.insertEmbed(range?.index, 'image', imageURL[0]);
      });
    }
  };

  // This code would solve the editor's height collapse, but it causes a crash on Android 10.
  // https://stackoverflow.com/questions/58519749/android-d0-probable-deadlock-detected-due-to-webview-api-being-called-on-incor
  // useEffect(() => {
  //   quillRef?.current?.focus();
  // }, []);

  return (
    <>
      <QuillEditor
        webview={{
          androidHardwareAccelerationDisabled: true,
          androidLayerType: 'software',
        }}
        autoSize
        ref={quillRef}
        initialHtml={
          textFormat === 'markdown' && initialBody
            ? markdownit.render(initialBody)
            : textFormat === 'html' && initialBody
            ? initialBody
            : undefined
        }
        style={{...textEditorStyles.quillEditor, minHeight: height}}
        quill={{
          // not required just for to show how to pass this props
          placeholder: '本文を入力',
          modules: {
            toolbar: false, // this is default value
          },
          theme: 'snow', // this is default value
        }}
        onDimensionsChange={({height: changedHeight}) =>
          setHeight(changedHeight)
        }
        onHtmlChange={({html}) => onChange(html)}
      />
      <QuillToolbar
        editor={quillRef}
        options={[
          [{header: 1}, {header: 2}, {header: 3}],
          ['bold', 'italic', 'strike'],
          ['blockquote', 'code-block'],
          [{list: 'ordered'}, {list: 'bullet'}],

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
    </>
  );
};

export default TextEditor;
