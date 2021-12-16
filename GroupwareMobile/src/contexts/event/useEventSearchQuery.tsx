import React, {useContext} from 'react';
import {createContext, useState} from 'react';
import {SearchQueryToGetEvents} from '../../hooks/api/event/useAPIGetEventList';

type Query = Pick<
  SearchQueryToGetEvents,
  'word' | 'tag' | 'type' | 'participant_id'
>;

// eslint-disable-next-line no-spaced-func
const EventCardListSearchQueryContext = createContext<{
  partOfSearchQuery: Query;
  setPartOfSearchQuery: (query: Query) => void;
}>({
  partOfSearchQuery: {},
  setPartOfSearchQuery: () => {},
});

export const EventCardListSearchQueryProvider: React.FC = ({children}) => {
  const [partOfSearchQuery, setPartOfSearchQuery] = useState<Query>({});

  const handlePartOfSearchQuery = (query: Partial<SearchQueryToGetEvents>) => {
    setPartOfSearchQuery(q => ({...q, ...query}));
  };

  return (
    <EventCardListSearchQueryContext.Provider
      value={{
        partOfSearchQuery,
        setPartOfSearchQuery: handlePartOfSearchQuery,
      }}>
      {children}
    </EventCardListSearchQueryContext.Provider>
  );
};
export const useEventCardListSearchQuery = () =>
  useContext(EventCardListSearchQueryContext);
