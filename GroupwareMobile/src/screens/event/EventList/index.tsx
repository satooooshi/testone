import React from 'react';
import {EventCardListSearchQueryProvider} from '../../../contexts/event/useEventSearchQuery';
import EventSearcher from './EventSearcher';

const EventList: React.FC = () => {
  return (
    <EventCardListSearchQueryProvider>
      <EventSearcher />
    </EventCardListSearchQueryProvider>
  );
};

export default EventList;
