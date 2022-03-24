import React from 'react';
import {useState, useEffect} from 'react';
import {Text} from 'react-native-magnus';
import {useInviteCall} from '../../../contexts/call/useInviteCall';
import BackgroundTimer from 'react-native-background-timer';
import {Platform} from 'react-native';

const Timer = () => {
  const {setCallTimeState} = useInviteCall();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval = BackgroundTimer.setInterval(() => {
      setSeconds(seconds + 1);
      if (seconds === 59) {
        setMinutes(minutes + 1);
        setSeconds(0);
      }
      if (minutes === 59) {
        setHours(hours + 1);
        setMinutes(0);
      }
    }, 1000);
    return () => {
      BackgroundTimer.clearInterval(interval);
    };
  });

  useEffect(
    () => {
      const h = hours ? `${hours}:` : '';
      const m = minutes || hours ? `${minutes}:` : '0:';
      const s = seconds < 10 ? `0${seconds}` : seconds;
      setCallTimeState(h + m + s);
    }, //eslint-disable-next-line react-hooks/exhaustive-deps
    [seconds],
  );

  return (
    <Text mt={'lg'} mb={'lg'} fontSize={20}>
      {hours ? `${hours}:` : ''}
      {minutes < 10 ? `0${minutes}` : minutes}:
      {seconds < 10 ? `0${seconds}` : seconds}
    </Text>
  );
};

export default Timer;
