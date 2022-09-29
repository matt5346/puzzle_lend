import React from 'react';
import styled from '@emotion/styled';

const Root = styled.div`
  display: block;
  width: 100%;
`;

const circleNum = 8;
// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

const Preloader: React.FC<IProps> = () => {
  return (
    <Root className="sk-fading-circle">
      {Array.from({ length: circleNum }, (_, i) => (
        <div key={i} className={`sk-circle sk-circle${i}`} />
      ))}
    </Root>
  );
};
export default Preloader;
