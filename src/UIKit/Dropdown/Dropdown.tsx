/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/require-default-props */
import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import { Text } from '@src/UIKit/Text';
import { ReactComponent as ChevronDown } from '@src/common/assets/icons/chevron_down.svg';

interface IProps {
  title?: string;
  children?: string;
  isOpened?: boolean;
}

const ListGroupItem = styled.div`
  position: relative;
  padding: 24px 16px;
  border-radius: 12px;
  background-color: #fff;
  cursor: pointer;
  transition: background 0.1s ease;

  svg {
    position: absolute;
    top: 20px;
    right: 15px;
    transition: transform 0.3s ease;
  }

  &:hover {
    background-color: #f1f2fe;
  }

  &.is-expanded {
    svg {
      transform: rotate(180deg);
    }
  }

  .card-title {
    color: #363870;
    font-size: 20px;
    width: 85%;

    @media (min-width: 550px) {
      width: 100%;
    }
  }

  h2 {
    margin-top: 5px !important;
  }

  @media (min-width: 550px) {
    padding: 24px;

    svg {
      right: 20px;
    }
  }
`;

const CollapseBlock = styled.div`
  overflow: hidden;
  width: 85%;
  transition: height 0.15s ease;

  .is-expanded & {
    margin-top: 24px;
  }

  @media (min-width: 550px) {
    width: 100%;
  }
`;

const Dropdown: React.FC<IProps> = ({ title, children, isOpened = false }) => {
  const [isExpanded, setIsExpanded] = React.useState(isOpened);

  const ref = React.useRef<HTMLDivElement>(null);

  const [height, setHeight] = React.useState<number | undefined>(1);

  const handleToggle = (e: any) => {
    e.preventDefault();
    setIsExpanded(!isExpanded);

    if (ref.current && ref.current.clientHeight) {
      setHeight(ref.current.clientHeight);
    }
  };

  useEffect(() => {
    if (isOpened) {
      setIsExpanded(true);

      if (ref.current && ref.current.clientHeight) {
        setHeight(ref.current.clientHeight);
      }
    }
  }, [isOpened]);

  const classes = `list-group-item ${isExpanded ? 'is-expanded' : null}`;
  const currentHeight = isExpanded ? height : 0;

  return (
    <ListGroupItem className={classes} onClick={handleToggle}>
      <Text type="primary" className="card-title">
        {title}
      </Text>
      <ChevronDown />
      <CollapseBlock className="card-collapse" style={{ height: `${currentHeight}px` }}>
        <Text className="card-body" ref={ref}>
          {children}
        </Text>
      </CollapseBlock>
    </ListGroupItem>
  );
};

export default Dropdown;
