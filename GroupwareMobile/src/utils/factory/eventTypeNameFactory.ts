import {EventType} from '../../types';

const eventTypeNameFactory = (type: EventType): any => {
  switch (type) {
    case EventType.ARTIST:
      return 'アーティスト';
    case EventType.IDOL:
      return 'アイドル';
    case EventType.YOUTUBER:
      return 'YouTuber';
    case EventType.TIKTOKER:
      return 'TikToker';
    case EventType.INSTAGRAMER:
      return 'インスタグラマー';
    case EventType.TALENT:
      return 'タレント';
    case EventType.OTHER:
      return 'その他';
  }
};

export default eventTypeNameFactory;
