export enum EventTab {
  ALL = 'All',
  ARTIST = 'アーティスト',
  IDOL = 'アイドル',
  YOUTUBER = 'YouTuber',
  TIKTOKER = 'TikToker',
  INSTAGRAMER = 'インスタグラマー',
  TALENT = 'タレント',
  OTHER = 'その他',
}

export type Tab = {
  type?: 'backButton' | 'create' | 'edit' | 'delete';
  name: string;
  onClick?: () => void;
  href?: string;
  color?: string;
  isActive?: boolean;
};
// | {
//     type?: ;
//     name: string;
//     color?: string;
//   };

export enum TabName {
  EDIT = 'edit',
  PREVIEW = 'preview',
  DETAIL = 'detail',
  EVENT = 'event',
  QUESTION = 'question',
  KNOWLEDGE = 'knowledge',
  GOOD = 'good',
  ANSWER = 'answer', // FIXME: 使用されている箇所がないかもしれないです...
}
