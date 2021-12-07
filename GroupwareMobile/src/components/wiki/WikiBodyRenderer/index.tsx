import React from 'react';
import {useWindowDimensions} from 'react-native';
import {RenderHTMLSource, Document} from 'react-native-render-html';

const WikiBodyRenderer = ({dom}: {dom: Document | string | null}) => {
  const {width: windowWidth} = useWindowDimensions();
  return (
    <>
      {dom ? (
        <RenderHTMLSource
          contentWidth={windowWidth * 0.9}
          source={{
            dom: dom as Document,
          }}
        />
      ) : null}
    </>
  );
};
export default WikiBodyRenderer;
