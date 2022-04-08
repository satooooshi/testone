import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Appearance,
  Platform,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import tailwind from 'tailwind-rn';

type WholeContainerProps = {
  color?: 'auth' | 'white' | 'gray';
};

const WholeContainer: React.FC<WholeContainerProps> = props => {
  const {children} = props;
  return (
    <>
      <SafeAreaView style={WholeContainerStyle.statusBar} />
      <StatusBar
        barStyle={
          Platform.OS === 'ios' && Appearance.getColorScheme() === 'dark'
            ? 'dark-content'
            : 'default'
        }
      />
      <SafeAreaView
        {...props}
        style={[WholeContainerStyle.safeArea, WholeContainerStyle.grayColor]}>
        <GestureHandlerRootView style={tailwind('flex-1')}>
          {children}
        </GestureHandlerRootView>
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
