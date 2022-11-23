import {findAll} from 'domutils';
import {useEffect, useMemo, useState} from 'react';
import {useAmbientTRenderEngine} from 'react-native-render-html';
import {Element} from 'domhandler';
import linkifyHtml from 'linkify-html';

export const useDom = (html: string) => {
  const engine = useAmbientTRenderEngine();
  const [headings, setHeadings] = useState<Element[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const dom = useMemo(() => {
    if (typeof html === 'string') {
      const parsedDom = engine.parseDocument(linkifyHtml(html));
      return parsedDom;
    }
    return null;
  }, [html, engine]);

  useEffect(
    function extractHeadings() {
      if (dom != null) {
        const article = dom.children[0] as Element;
        let imageUris: string[] = [];
        const headers = findAll(elm => {
          if (elm.tagName === 'img') {
            imageUris.push(elm.attribs.src);
            console.log('-----', elm.attribs.src);
          }
          return (
            (elm.tagName === 'h1' || elm.tagName === 'h2') &&
            //@ts-ignore
            elm.children[0]?.name !== 'br' &&
            elm.children[0]?.nodeType !== undefined
          );
        }, article.children);
        setHeadings(headers);
        setImageUrls(imageUris);
        console.log('-----img', imageUris);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dom],
  );
  return {
    dom,
    headings,
    imageUrls,
  };
};
