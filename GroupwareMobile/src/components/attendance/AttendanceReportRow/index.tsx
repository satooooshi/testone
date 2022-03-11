import {useFormik} from 'formik';
import {DateTime} from 'luxon';
import React, {useEffect, useRef, useState} from 'react';
import {Alert, u} from 'react-native';
import {Button, Div, Text} from 'react-native-magnus';
import {AttendanceRepo} from '../../../types';

type AttendanceReportRowProps = {
  reportData?: AttendanceRepo;
};

const AttendanceReportRow: React.FC<AttendanceReportRowProps> = ({
  reportData,
}) => {
  return (
    <>
      <Div minW={'20%'} justifyContent="center" alignItems="center">
        <Text fontSize={16}>{reportData?.targetDate}</Text>
      </Div>
      <Div minW={'30%'} justifyContent="center" alignItems="center">
        <Text>{reportData?.category}</Text>
      </Div>
      <Div minW={'30%'} justifyContent="center" alignItems="center">
        <Text>{reportData?.createdAt}</Text>
      </Div>
      <Div minW={'20%'} alignItems="center">
        <Text>{reportData?.verifiedAt}</Text>
      </Div>
    </>
  );
};
export default AttendanceReportRow;
