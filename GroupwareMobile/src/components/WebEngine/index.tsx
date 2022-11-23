import React, {useCallback} from 'react';
import {
  CustomBlockRenderer,
  CustomTagRendererRecord,
  MixedStyleDeclaration,
  MixedStyleRecord,
  RenderHTMLConfigProvider,
  TRenderEngineProvider,
} from 'react-native-render-html';
import {textContent} from 'domutils';
import {LayoutChangeEvent, Linking} from 'react-native';
import {useScroller} from '../../utils/htmlScroll/scroller';
import {useNavigation} from '@react-navigation/native';
import {linkOpen} from '../../utils/linkHelper';

const HeadingRenderer: CustomBlockRenderer = function HeaderRenderer({
  TDefaultRenderer,
  ...props
}) {
  const scroller = useScroller();
  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      scroller.registerScrollEntry(textContent(props.tnode.domNode!), e);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scroller],
  );
  return <TDefaultRenderer {...props} viewProps={{onLayout}} />;
};

const renderers: CustomTagRendererRecord = {
  h1: HeadingRenderer,
  h2: HeadingRenderer,
};

const tagsStyles: MixedStyleRecord = {
  a: {
    color: '#1c1e21',
    backgroundColor: 'rgba(187, 239, 253, 0.3)',
  },
  li: {
    marginBottom: 10,
  },
  img: {
    alignSelf: 'center',
  },
  h4: {
    marginBottom: 0,
    marginTop: 0,
  },
  code: {
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
    fontSize: 14,
  },
  blockquote: {
    marginLeft: 0,
    marginRight: 0,
    paddingLeft: 20,
    paddingRight: 20,
    backgroundColor: '#ececec',
    borderLeftWidth: 10,
    borderLeftColor: '#b0b0b0',
  },
};

const baseStyle: MixedStyleDeclaration = {
  color: '#1c1e21',
  fontSize: 16,
  lineHeight: 16 * 1.8,
};

const WebEngine = ({children}: React.PropsWithChildren<{}>) => {
  const navigation = useNavigation<any>();
  const handlePressAnchor = (url: string) => {
    const screenInfo = linkOpen(url);
    if (screenInfo) {
      const {screenName, idParams} = screenInfo;
      switch (screenName) {
        case 'AccountDetail':
          navigation.navigate('AccountStack', {
            screen: screenName,
            params: {id: idParams},
          });
          break;
        case 'WikiDetail':
          navigation.navigate('WikiStack', {
            screen: screenName,
            params: {id: idParams},
          });
          break;
        case 'EventDetail':
          navigation.navigate('EventStack', {
            screen: screenName,
            params: {id: idParams},
          });
          break;
      }
    } else {
      Linking.openURL(url);
    }
  };
  return (
    <TRenderEngineProvider tagsStyles={tagsStyles} baseStyle={baseStyle}>
      <RenderHTMLConfigProvider
        renderers={renderers}
        renderersProps={{
          a: {
            onPress: (_, href) => {
              handlePressAnchor(href);
            },
          },
        }}
        enableExperimentalMarginCollapsing>
        {children}
      </RenderHTMLConfigProvider>
    </TRenderEngineProvider>
  );
};

export default WebEngine;
