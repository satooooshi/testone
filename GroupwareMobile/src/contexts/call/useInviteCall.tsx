import React, {createContext, useContext, useState} from 'react';

const InvitationStatusContext = createContext({
  isInvitationSending: false,
  isCallAccepted: false,
  enableInvitationFlag: () => {},
  disableInvitationFlag: () => {},
  enableCallAcceptedFlag: () => {},
  disableCallAcceptedFlag: () => {},
});

export const InviteCallProvider: React.FC = ({children}) => {
  const [isInvitationSending, setIsInvitationSending] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(false);

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

  return (
    <InvitationStatusContext.Provider
      value={{
        isInvitationSending,
        isCallAccepted,
        enableInvitationFlag,
        disableInvitationFlag,
        enableCallAcceptedFlag,
        disableCallAcceptedFlag,
      }}>
      {children}
    </InvitationStatusContext.Provider>
  );
};

export const useInviteCall = () => useContext(InvitationStatusContext);
