import styled from '@emotion/styled';
import Skeleton from 'react-loading-skeleton';
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Text } from '@src/UIKit/Text';
import { useStores } from '@src/stores';
import { Button } from '@src/UIKit/Button';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Column } from '@src/common/styles/Flex';
import { Anchor } from '@src/UIKit/Anchor';
import { ReactComponent as Pics } from '@src/common/assets/icons/picsUnion.svg';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IProps {}

const Root = styled.div`
  display: flex;
  justify-content: center;
  min-height: 400px;
`;
const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding-top: 8px;
  column-gap: 8px;
  row-gap: 8px;
  height: fit-content;
`;
const Card = styled.div<{ img?: string }>`
  display: flex;
  width: 156px;
  height: 156px;
  border-radius: 8px;
  background: ${({ img }) => `url(${img}) no-repeat center`};
  background-color: #f1f2fe;
  background-size: 156px;
  position: relative;
`;
const Tag = styled.div`
  position: absolute;
  background: #363870;
  border-radius: 6px;
  padding: 4px 8px;
  bottom: 8px;
  left: 8px;
`;
const NFTs: React.FC<IProps> = () => {
  // const { nftStore } = useStores();
  // const { accountNFTs } = nftStore;

  return (
    <Root>
      <h2>nfts</h2>
    </Root>
  );
};
export default observer(NFTs);
