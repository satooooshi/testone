type ScreenName = 'AccountDetail' | 'WikiDetail' | 'EventDetail';

type LinkWithScreen =
  | {
      screenName: ScreenName;
      idParams: number;
    }
  | undefined;

export const domainregexBasedOnWebFrontend =
  /(http:\/\/localhost:3000|https:\/\/portal.bold.ne.jp|https:\/\/groupware-frontend-theta.vercel.app|https:\/\/groupware-frontend-sgzkfl3uyq-an.a.run.app)\/(event|wiki\/detail|account)\/([0-9]+)/g;

export const linkOpen = (url: string): LinkWithScreen => {
  const screenName = url.replace(domainregexBasedOnWebFrontend, '$2');
  const params = url.replace(domainregexBasedOnWebFrontend, '$3');
  let targetScreen: ScreenName | undefined;
  targetScreen =
    screenName === 'event'
      ? (targetScreen = 'EventDetail')
      : screenName === 'wiki/detail'
      ? 'WikiDetail'
      : screenName === 'account'
      ? 'AccountDetail'
      : undefined;
  if (targetScreen && params && typeof Number(params) === 'number') {
    return {
      screenName: targetScreen,
      idParams: Number(params),
    };
  }
  return undefined;
};
