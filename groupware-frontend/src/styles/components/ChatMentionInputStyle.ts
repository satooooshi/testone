export const chatMentionInputStyle = {
  height: '100%',
  width: '100%',
  control: {
    backgroundColor: '#fff',
    fontSize: 14,
    fontWeight: 'normal',
    overFlow: 'scroll',
    height: '100%',
    width: '100%',
    lineHeight: 'initial',
  },

  '&multiLine': {
    control: {
      minHeight: 63,
      overFlow: 'scroll',
      width: '100%',
      lineHeight: 'initial',
    },
    highlighter: {
      height: '100%',
      padding: 9,
      border: '1px solid transparent',
      width: '100%',
      wordBreak: 'break-word',
    },
    input: {
      padding: 9,
      overflow: 'scroll',
      wordWrap: 'break-word',
      width: '100%',
    },
  },

  suggestions: {
    list: {
      backgroundColor: 'white',
      border: '1px solid rgba(0,0,0,0.15)',
      fontSize: 14,
    },
    item: {
      padding: '5px 15px',
      borderBottom: '1px solid rgba(0,0,0,0.15)',
      '&focused': {
        backgroundColor: '#cee4e5',
      },
    },
  },
};
