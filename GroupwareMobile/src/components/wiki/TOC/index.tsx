import React, {useState} from 'react';
import {textContent} from 'domutils';
import {Element} from 'domhandler';
import TOCEntry from './TOCEntry';
import {useEffect} from 'react';
import {useScroller} from '../../../utils/htmlScroll/scroller';
import {Div} from 'react-native-magnus';

function useOnEntryChangeEffect(onEntryChange: (entryName: string) => void) {
  const scroller = useScroller();
  useEffect(
    function updateActiveTargetOnScroll() {
      if (scroller !== null) {
        scroller.addSelectedEntryListener(onEntryChange);
        return () => scroller.removeSelectedEntryListener(onEntryChange);
      }
    },
    [scroller, onEntryChange],
  );
}

export default function TOC({
  headings,
  onPressEntry,
}: {
  headings: Element[];
  onPressEntry?: (name: string) => void;
}) {
  const [activeEntry, setActiveEntry] = useState(
    headings.length ? textContent(headings[0]) : '',
  );
  useOnEntryChangeEffect(setActiveEntry);
  return (
    <Div>
      {headings.map(header => {
        const headerName = textContent(header);
        const onPress = () => {
          setActiveEntry(headerName);
          onPressEntry?.(headerName);
        };
        return (
          <TOCEntry
            active={headerName === activeEntry}
            key={headerName}
            onPress={onPress}
            tagName={header.tagName}
            headerName={headerName}
          />
        );
      })}
    </Div>
  );
}
