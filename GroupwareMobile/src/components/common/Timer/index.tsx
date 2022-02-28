import React from 'react';
import {useState, useEffect} from 'react';
import {Text} from 'react-native-magnus';
import {useInviteCall} from '../../../contexts/call/useInviteCall';

const Timer = () => {
  const {setCallTimeState} = useInviteCall();
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    let myInterval = setInterval(() => {
      setSeconds(seconds + 1);
      if (seconds === 60) {
        setMinutes(minutes + 1);
        setSeconds(0);
      }
      if (minutes === 60) {
        setHours(hours + 1);
        setMinutes(0);
      }
    }, 1000);
    return () => {
      clearInterval(myInterval);
    };
  });

  useEffect(() => {
    const h = hours ? `${hours}:` : '';
    const m = minutes || hours ? `${minutes}:` : '0:';
    const s = seconds < 10 ? `0${seconds}` : seconds;
    setCallTimeState(h + m + s);
  }, [seconds, minutes, hours, setCallTimeState]);

  return (
    <Text mt={'lg'} mb={'lg'} fontSize={20}>
      {hours ? `${hours}:` : ''}
      {minutes < 10 ? `0${minutes}` : minutes}:
      {seconds < 10 ? `0${seconds}` : seconds}
    </Text>
  );
};

export default Timer;
