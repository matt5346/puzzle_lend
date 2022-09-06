/* eslint-disable react/destructuring-assignment */
import React from 'react';

interface IProps {
  symbol: string;
  label: string;
}

const Emoji: React.FC<IProps> = (props) => {
  return (
    <span
      className="emoji"
      role="img"
      aria-label={props.label ? props.label : ''}
      aria-hidden={props.label ? 'false' : 'true'}>
      {props.symbol}
    </span>
  );
};

export default Emoji;
