import React, {ReactNode} from 'react';
import HeaderTemplate, {HeaderTemplateProps} from './HeaderTemplate';

type HeaderWithIconButtonProps = HeaderTemplateProps & {
  icon: ReactNode;
};

const HeaderWithIconButton: React.FC<HeaderWithIconButtonProps> = props => {
  const {icon} = props;
  return <HeaderTemplate {...props}>{icon && icon}</HeaderTemplate>;
};

export default HeaderWithIconButton;
