import React, {useContext} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  StatusBar,
  Appearance,
  Platform,
} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import tailwind from 'tailwind-rn';
import {useIsTabBarVisible} from '../../contexts/bottomTab/useIsTabBarVisible';

type WholeContainerProps = {
  color?: 'auth' | 'white' | 'gray';
};

const WholeContainer: React.FC<WholeContainerProps> = props => {
  const {children} = props;
  const {updateSafeAreaViewHeight} = useIsTabBarVisible();
  return (
    <>
      <SafeAreaView
        style={WholeContainerStyle.statusBar}
        onLayout={(e): void => {
          if (e.nativeEvent.layout.height > 0) {
            updateSafeAreaViewHeight(e.nativeEvent.layout.height);
          }
        }}
      />
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
