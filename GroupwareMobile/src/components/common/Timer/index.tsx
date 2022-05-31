import React from 'react';
import {useState, useEffect} from 'react';
import {Text} from 'react-native-magnus';
import {useInviteCall} from '../../../contexts/call/useInviteCall';
import BackgroundTimer from 'react-native-background-timer';
import {Platform} from 'react-native';

type TimerProps = {
  isCalling: boolean;
  CallTimeout: () => void;
};

const Timer: React.FC<TimerProps> = ({isCalling, CallTimeout}) => {
  const {setCallTimeState} = useInviteCall();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (isCalling) {
      initTimer();
    }
  }, [isCalling]);

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
      if (isCalling) {
        const h = hours ? `${hours}:` : '';
        const m = minutes || hours ? `${minutes}:` : '0:';
        const s = seconds < 10 ? `0${seconds}` : seconds;
        setCallTimeState(h + m + s);
      }
      if (!isCalling && seconds > 20) {
        CallTimeout();
      }
    }, //eslint-disable-next-line react-hooks/exhaustive-deps
    [seconds],
  );

  const initTimer = () => {
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  };

  return (
    <>
      {isCalling ? (
        <Text mt={'lg'} mb={'lg'} fontSize={20}>
          {hours ? `${hours}:` : ''}
          {minutes < 10 ? `0${minutes}` : minutes}:
          {seconds < 10 ? `0${seconds}` : seconds}
        </Text>
      ) : (
        <Text mt={'lg'} mb={'lg'} fontSize={20}>
          呼び出し中
        </Text>
      )}
    </>
  );
};

export default Timer;
