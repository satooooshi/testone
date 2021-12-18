import {StyleSheet} from 'react-native';

export const textEditorStyles = StyleSheet.create({
  richEditor: {
    minHeight: 300,
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e3e3e3',
  },
  quillEditor: {
    flex: 1,
    minHeight: 200,
  },
});
