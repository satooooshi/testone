import React, {createContext, useContext, useState} from 'react';

const InvitationStatusContext = createContext({
  isInvitationSending: false,
  enableInvitationFlag: () => {},
  disableInvitationFlag: () => {},
});

export const InviteCallProvider: React.FC = ({children}) => {
  const [isInvitationSending, setIsInvitationSending] = useState(false);

  const enableInvitationFlag = () => {
    setIsInvitationSending(true);
  };
  const disableInvitationFlag = () => {
    setIsInvitationSending(false);
  };

  return (
    <InvitationStatusContext.Provider
      value={{
        isInvitationSending,
        enableInvitationFlag,
        disableInvitationFlag,
      }}>
      {children}
    </InvitationStatusContext.Provider>
  );
};

export const useInviteCall = () => useContext(InvitationStatusContext);
