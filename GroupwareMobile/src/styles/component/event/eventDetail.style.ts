import {StyleSheet} from 'react-native';

export const eventDetail = StyleSheet.create({
  comment_count_wrapper: {
    borderBottomColor: '#5dc6a9',
    borderBottomWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 8,
  },
  comment_card_wrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  comment_info_wrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comment_writer_info_wrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  comment_body: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  create_comment_form: {
    borderRadius: 8,
    height: 100,
    padding: 8,
    backgroundColor: 'white',
    borderColor: 'rgb(49, 130, 206)',
    borderWidth: 1,
  },
});
