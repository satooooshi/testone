import {EventType} from '../../types';

export const eventTypeColorFactory = (type: EventType): string => {
  switch (type) {
    case EventType.ARTIST:
      return '#3182ce';
    case EventType.IDOL:
      return '#f6ad55';
    case EventType.YOUTUBER:
      return '#38a169';
    case EventType.TIKTOKER:
      return '#90cdf4';
    case EventType.INSTAGRAMER:
      return '#f56565';
    case EventType.TALENT:
      return '#086f83';
    case EventType.OTHER:
      return 'gray';
  }
};
