/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/require-default-props */
import React from 'react';
import styled from '@emotion/styled';
import { Text } from '@src/UIKit/Text';

interface IProps {
  title?: string;
  children?: string;
}

const ListGroupItem = styled.div`
  padding: 24px;
  border-radius: 12px;
  background-color: #fff;
  cursor: pointer;

  &:hover {
    background-color: #f1f2fe;
  }

  .card-title {
    color: #363870;
    font-size: 20px;
  }
  h2 {
    margin-top: 5px !important;
  }
`;

const CollapseBlock = styled.div`
  overflow: hidden;

  .is-expanded & {
    margin-top: 24px;
  }
`;

const Dropdown: React.FC<IProps> = ({ title, children }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const ref = React.useRef<HTMLDivElement>(null);

  const [height, setHeight] = React.useState<number | undefined>(1);

  const handleToggle = (e: any) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);
    console.log(ref, 'REF');

    if (ref.current && ref.current.clientHeight) {
      setHeight(ref.current.clientHeight);
    }
  };

  const classes = `list-group-item ${isExpanded ? 'is-expanded' : null}`;
  const currentHeight = isExpanded ? height : 0;

  return (
    <ListGroupItem className={classes} onClick={handleToggle}>
      <Text className="card-title">{title}</Text>
      <CollapseBlock className="card-collapse" style={{ height: `${currentHeight}px` }}>
        <Text className="card-body" ref={ref}>
          {children}
        </Text>
      </CollapseBlock>
    </ListGroupItem>
  );
};

export default Dropdown;
