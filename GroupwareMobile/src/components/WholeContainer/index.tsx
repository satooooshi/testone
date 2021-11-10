import React from 'react';
import {SafeAreaView, StyleSheet, StatusBar} from 'react-native';

type WholeContainerProps = {
  color?: 'auth' | 'white' | 'gray';
};

const WholeContainer: React.FC<WholeContainerProps> = props => {
  const {children} = props;
  return (
    <>
      <SafeAreaView style={WholeContainerStyle.statusBar} />
      <StatusBar />
      <SafeAreaView
        {...props}
        style={[WholeContainerStyle.safeArea, WholeContainerStyle.grayColor]}>
        {children}
      </SafeAreaView>
    </>
  );
};

const WholeContainerStyle = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  whiteColor: {
    backgroundColor: '#fff',
  },
  grayColor: {
    backgroundColor: '#F2F4FA',
  },
  statusBar: {
    flex: 0,
  },
});

export default WholeContainer;
