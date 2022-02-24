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
  isCallAccepted: false,
  localInvitation: {} as LocalInvitation | undefined,
  setLocalInvitationState: (() => {}) as (
    invitation: LocalInvitation | undefined,
  ) => void,
  enableCallAcceptedFlag: () => {},
  disableCallAcceptedFlag: () => {},
  ringCall: () => {},
  stopRing: () => {},
});

export const InviteCallProvider: React.FC = ({children}) => {
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [localInvitation, setLocalInvitation] = useState<
    LocalInvitation | undefined
  >();
  const enableCallAcceptedFlag = () => {
    setIsCallAccepted(true);
  };
  const disableCallAcceptedFlag = () => {
    setIsCallAccepted(false);
  };
  const ringCall = () => {
    SoundPlayer.playSoundFile('ring_call', 'mp3');
  };
  const stopRing = useCallback(() => {
    SoundPlayer.stop();
  }, []);

  const setLocalInvitationState = (invitation: LocalInvitation | undefined) => {
    setLocalInvitation(invitation);
  };

  useEffect(() => {
    if (localInvitation) {
      ringCall();
    } else {
      stopRing();
    }
  }, [localInvitation, stopRing]);

  useEffect(() => {
    if (isCallAccepted) {
      stopRing();
    }
  }, [isCallAccepted, stopRing]);

  return (
    <InvitationStatusContext.Provider
      value={{
        isCallAccepted,
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
