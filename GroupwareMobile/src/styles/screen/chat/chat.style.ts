import {Platform, StyleSheet} from 'react-native';

export const chatStyles = StyleSheet.create({
  footerBarArea: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'baseline',
  },
  inputArea: {
    flexDirection: 'row',
    backgroundColor: '#f5f6fa',
    padding: 5,
    paddingLeft: 15,
    borderRadius: 20,
  },
  inputAndroid: {
    flex: 1,
    paddingVertical: 0,
    color: 'black',
  },
  inputIos: {
    flex: 1,
    paddingBottom: 4,
  },
  keyboardAvoidingView: {},
  keyboardAvoidingViewIOS: {
    flex: 1,
    marginBottom: 0,
  },
  keyboardAvoidingViewAndroid: {
    paddingBottom: 20,
  },
  image: {
    aspectRatio: 1,
  },
  flatlist: {
    height: Platform.OS === 'ios' ? '80%' : '85%',
  },
  flatlistContent: {
    marginHorizontal: 8,
  },
  video: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#b0b0b0',
  },
  cancelIcon: {
    position: 'absolute',
    top: 50,
    right: 40,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
});
