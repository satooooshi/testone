import React, {useRef} from 'react';
import WebView from 'react-native-webview';
import {baseURL, jwtFormDataHeader, markdownEditorURL} from '../../utils/url';
import {uploadStorageURL} from '../../utils/url/storage.url';

type MarkdownEditorProps = {
  onChange: (markdownText: string) => void;
  value?: string;
};

const MarkdownEditorWebView: React.FC<MarkdownEditorProps> = ({
  onChange,
  value,
}) => {
  const injectedJavaScript: string = `
  window.UPLOAD_STORAGE_URL = '${baseURL}${uploadStorageURL}';
  window.JWT_HEADER = ${JSON.stringify(jwtFormDataHeader)};
  window.INIT_TEXT = '${value || ''}';
  `;
  const webViewRef = useRef<WebView | null>(null);
  return (
    <WebView
      scrollEnabled={false}
      ref={webViewRef}
      source={{
        uri: markdownEditorURL,
      }}
      injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
      onMessage={event => {
        const markdownText = event.nativeEvent.data as string;
        onChange(markdownText);
      }}
    />
  );
};

export default MarkdownEditorWebView;
