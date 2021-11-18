import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
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
  const isFocused = useIsFocused();
  const webViewRef = useRef<WebView | null>(null);

  useEffect(() => {
    setTimeout(() => {
      webViewRef.current?.postMessage(
        JSON.stringify({
          url: `${baseURL}${uploadStorageURL}`,
          header: jwtFormDataHeader,
          initText: `${value}`,
        }),
      );
    }, 500);
  }, [isFocused, value]);

  return (
    <WebView
      cacheEnabled={false}
      scrollEnabled={false}
      ref={webViewRef}
      source={{
        uri: markdownEditorURL,
      }}
      onMessage={event => {
        const markdownText = event.nativeEvent.data as string;
        onChange(markdownText);
      }}
    />
  );
};

export default MarkdownEditorWebView;
