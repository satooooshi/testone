import './App.css';
import Editor from 'react-markdown-editor-lite';
import MarkdownIt from 'markdown-it';
import 'react-markdown-editor-lite/lib/index.css';
import axios from 'axios';
import {useState, useEffect} from 'react';

function App() {
  const [initText, setInitText] = useState('');
  const [value, setValue] = useState('');
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
    if (window.URL && window.HEADER) {
      const uploadStorageURL = window.URL;
      try {
        const formData = new FormData();
        for (const file of files) {
          formData.append('files', file);
        }
        const res = await axios.post(uploadStorageURL, formData, {
          headers: window.HEADER,
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
  useEffect(() => {
    function handleData(data) {
      const parsed = JSON.parse(data.data);
      if (parsed?.url) {
        window.URL = parsed?.url;
      }
      if (parsed?.header) {
        window.HEADER = parsed?.header;
      }
      if (parsed?.initText) {
        setInitText(parsed?.initText);
      }
    }
    window.addEventListener('message', handleData);
    return () => window.removeEventListener('message', handleData);
  }, []);

  useEffect(() => {
    if (initText) {
      setValue(v => {
        if (!v) {
          return initText;
        }
        return v;
      });
    }
  }, [initText]);

  return (
    <Editor
      style={{height: '80vh', width: '100vw'}}
      defaultValue={initText}
      onImageUpload={file => {
        return uploadStorage([file]);
      }}
      value={value}
      onChange={v => {
        // window.onChange && window.onChange(value);
        window.ReactNativeWebView &&
          window.ReactNativeWebView.postMessage(v.text);
        setValue(v.text);
      }}
      placeholder="質問内容を入力して下さい"
      plugins={liteEditorPlugins}
      renderHTML={text => mdParser.render(text)}
    />
  );
}

export default App;
