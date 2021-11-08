export const responseErrorMsgFactory = (errors: Array<string>) => {
  let messages = '';
  for (const e of errors) {
    messages += `${e}\n`;
  }
  return messages;
};
