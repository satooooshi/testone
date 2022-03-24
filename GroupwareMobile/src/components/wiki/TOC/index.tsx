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
  activeEntry = textContent(headings[0]),
  setActiveEntry,
}: {
  headings: Element[];
  onPressEntry?: (name: string) => void;
  activeEntry: string;
  setActiveEntry: React.Dispatch<React.SetStateAction<string>>;
}) {
  useOnEntryChangeEffect(setActiveEntry);
  const checkIsNotEmptyChar = (char: string) => char !== '';
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
            active={
              checkIsNotEmptyChar(activeEntry)
                ? headerName === activeEntry
                : headerName === textContent(headings[0])
            }
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
