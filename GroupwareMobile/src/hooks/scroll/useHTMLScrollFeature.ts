import {useMemo, useRef} from 'react';
import {ScrollView} from 'react-native-gesture-handler';
import HtmlScroller from '../../utils/htmlScroll/HtmlScroller';

export const useHTMLScrollFeature = (scrollerDep: any) => {
  const scrollViewRef = useRef<null | ScrollView>(null);
  const scroller = useMemo(
    () => new HtmlScroller(scrollViewRef),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [scrollerDep],
  );
  return {
    scroller,
    scrollViewRef,
  };
};
