import React from 'react';
import Editor from 'react-markdown-editor-lite';
import { HtmlType } from 'react-markdown-editor-lite/cjs/editor/preview';
import { EditorConfig } from 'react-markdown-editor-lite/cjs/share/var';
import 'react-markdown-editor-lite/lib/index.css';

//this interface is the copy of react-markdown-editor-lite@1.3.0
interface EditorProps extends EditorConfig {
  id?: string;
  defaultValue?: string;
  value?: string;
  renderHTML: (text: string) => HtmlType | Promise<HtmlType> | (() => HtmlType);
  style?: React.CSSProperties;
  autoFocus?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  config?: any;
  plugins?: string[];
  imageAccept: string;
  onChange?: (
    data: {
      text: string;
      html: string;
    },
    event?: React.ChangeEvent<HTMLTextAreaElement>,
  ) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onScroll?: (
    e: React.UIEvent<HTMLTextAreaElement | HTMLDivElement>,
    type: 'md' | 'html',
  ) => void;
  editorRef?: React.LegacyRef<Editor>;
}
const WrappedEditor: React.FC<EditorProps> = ({ editorRef, ...props }) => {
  return <Editor {...props} ref={editorRef} />;
};
export default WrappedEditor;
