import './App.css';
import Editor from 'react-markdown-editor-lite';
import MarkdownIt from 'markdown-it';
import 'react-markdown-editor-lite/lib/index.css';
import axios from 'axios';

function App() {
  const mdParser = new MarkdownIt({
    breaks: true,
  });

  const liteEditorPlugins = [
    'header',
    'font-bold',
    'font-italic',
    'font-strikethrough',
    'block-quote',
    'block-code-inline',
    'block-code-block',
    'image',
    'clear',
    'logger',
    'mode-toggle',
    'full-screen',
    'tab-insert',
  ];
  const uploadStorage = async files => {
    if (window.UPLOAD_STORAGE_URL && window.JWT_HEADER) {
      const uploadStorageURL = window.UPLOAD_STORAGE_URL;
      try {
        const formData = new FormData();
        for (const file of files) {
          formData.append('files', file);
        }
        const res = await axios.post(uploadStorageURL, formData, {
          headers: window.JWT_HEADER,
        });
        return res.data[0];
      } catch (err) {
        if (err instanceof Error) {
          throw new Error(err.message);
        }
        throw new Error('except error object');
      }
    }
  };

  return (
    <Editor
      style={{height: '80vh', width: '100vw'}}
      defaultValue={window.INIT_TEXT ? window.INIT_TEXT : ''}
      onImageUpload={file => {
        return uploadStorage([file]);
      }}
      onChange={value => {
        // window.onChange && window.onChange(value);
        window.ReactNativeWebView &&
          window.ReactNativeWebView.postMessage(value.text);
      }}
      placeholder="質問内容を入力して下さい"
      plugins={liteEditorPlugins}
      renderHTML={text => mdParser.render(text)}
    />
  );
}

export default App;
