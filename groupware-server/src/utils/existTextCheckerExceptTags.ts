export function existTextCheckerExceptTags(target: string): boolean {
  // タグとスペース以外に何かしらテキストが有るかチェック
  const isExist = target
    .replace(/<("[^"]*"|'[^']*'|[^'">])*>|&nbsp;/g, '')
    .trim();

  if (!isExist) {
    return false;
  }
  return true;
}
