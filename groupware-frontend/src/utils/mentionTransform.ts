export const mentionTransform = (message: string) => {
  const mentionRegex = /{@}\[(.*?)\]\([0-9]+\)/g;
  return message.replace(mentionRegex, '@$1');
};
