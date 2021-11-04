import React, {useRef} from 'react';
import WebView from 'react-native-webview';
import {baseURL, jwtFormDataHeader, markdownEditorURL} from '../../utils/url';
import {uploadStorageURL} from '../../utils/url/storage.url';

type MarkdownEditorProps = {
  onChange: (markdownText: string) => void;
};

const MarkdownEditorWebView: React.FC<MarkdownEditorProps> = ({onChange}) => {
  const injectedJavaScript: string = `
  window.UPLOAD_STORAGE_URL = '${baseURL}${uploadStorageURL}';
  window.JWT_HEADER = ${JSON.stringify(jwtFormDataHeader)};
  `;
  const webViewRef = useRef<WebView | null>(null);
  return (
    <WebView
      ref={webViewRef}
      source={{
        uri: markdownEditorURL,
      }}
      injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
      onMessage={event => {
        // event.nativeEvent.data is markdown text string
        const markdownText = event.nativeEvent.data as string;
        onChange(markdownText);
      }}
    />
  );
};

export default MarkdownEditorWebView;
