import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import SoundPlayer from 'react-native-sound-player';
import {LocalInvitation} from 'agora-react-native-rtm';

const InvitationStatusContext = createContext({
  isInvitationSending: false,
  isCallAccepted: false,
  localInvitation: {} as LocalInvitation | undefined,
  setLocalInvitationState: (() => {}) as (
    invitation: LocalInvitation | undefined,
  ) => void,
  enableInvitationFlag: () => {},
  disableInvitationFlag: () => {},
  enableCallAcceptedFlag: () => {},
  disableCallAcceptedFlag: () => {},
  ringCall: () => {},
  stopRing: () => {},
});

export const InviteCallProvider: React.FC = ({children}) => {
  const [isInvitationSending, setIsInvitationSending] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [localInvitation, setLocalInvitation] = useState<
    LocalInvitation | undefined
  >();
  SoundPlayer.loadSoundFile('ring_call', 'mp3');

  const enableInvitationFlag = () => {
    setIsInvitationSending(true);
  };
  const disableInvitationFlag = () => {
    setIsInvitationSending(false);
  };
  const enableCallAcceptedFlag = () => {
    setIsCallAccepted(true);
  };
  const disableCallAcceptedFlag = () => {
    setIsCallAccepted(false);
  };
  const ringCall = () => {
    SoundPlayer.play();
  };
  const stopRing = useCallback(() => {
    SoundPlayer.stop();
  }, []);

  const setLocalInvitationState = (invitation: LocalInvitation | undefined) => {
    setLocalInvitation(invitation);
  };

  useEffect(() => {
    if (isCallAccepted) {
      stopRing();
    }
  }, [isCallAccepted, stopRing]);

  return (
    <InvitationStatusContext.Provider
      value={{
        isInvitationSending,
        isCallAccepted,
        enableInvitationFlag,
        disableInvitationFlag,
        enableCallAcceptedFlag,
        disableCallAcceptedFlag,
        ringCall,
        stopRing,
        localInvitation,
        setLocalInvitationState,
      }}>
      {children}
    </InvitationStatusContext.Provider>
  );
};

export const useInviteCall = () => useContext(InvitationStatusContext);
