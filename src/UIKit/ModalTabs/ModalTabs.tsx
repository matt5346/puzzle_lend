/* eslint-disable react/require-default-props */
import styled from '@emotion/styled';
import React, { CSSProperties } from 'react';
import { Text } from '@src/UIKit/Text';

type ITab = {
  name: string;
  additionalInfo?: string | number;
};

interface IProps {
  tabs: ITab[];
  indexIncrement?: number;
  activeTab: number;
  textColor?: string;
  setActive: (index: number) => void;
  style?: CSSProperties;
  tabStyle?: CSSProperties;
}

const Root = styled.div`
  display: flex;
  width: 100%;
  margin: 0 20px;
  padding: 4px;
  background: #f1f2fe;
  border-radius: 12px;
`;

const Tab = styled.div<{ active?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: center;
  padding: 4px 12px;
  cursor: pointer;
  background: ${({ active }) => (active ? '#fff;' : '#f1f2fe')};
  user-select: none;
  border-radius: 10px;
  transition: all 0.3s ease;

  :first-of-type {
    margin-right: 5px;
  }

  :hover {
    background: ${({ active }) => !active && '#ffffffad'}
  }
}
`;

// indexIncrement useful in case of borrow/supply modals
const Tabs: React.FC<IProps> = ({ tabs, activeTab, setActive, style, tabStyle, textColor, indexIncrement = 0 }) => {
  return (
    <Root style={style}>
      {tabs.map(({ additionalInfo, name }, index) => {
        const tabIndex = index + indexIncrement;

        return (
          <Tab key={tabIndex} active={tabIndex === activeTab} onClick={() => setActive(tabIndex)} style={tabStyle}>
            <Text type="blue500" weight={500}>
              {name}
              {additionalInfo != null && additionalInfo !== 0 && (
                <span style={{ color: '#8082C5', marginLeft: 10 }}>{additionalInfo}</span>
              )}
            </Text>
          </Tab>
        );
      })}
    </Root>
  );
};
export default Tabs;
