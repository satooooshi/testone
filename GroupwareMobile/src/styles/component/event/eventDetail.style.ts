import {StyleSheet} from 'react-native';

export const eventDetail = StyleSheet.create({
  commentCountWrapper: {
    borderBottomColor: '#5dc6a9',
    borderBottomWidth: 1,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 8,
  },
  commentCardWrapper: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  commentInfoWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentWriterInfoWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentBody: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  createCommentForm: {
    borderRadius: 8,
    height: 100,
    padding: 8,
    backgroundColor: 'white',
    borderColor: 'rgb(49, 130, 206)',
    borderWidth: 1,
  },
});
