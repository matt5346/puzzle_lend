import React from "react";
import { observer } from "mobx-react-lite";
// import InvestRow, { InvestRowSkeleton } from "@src/components/InvestRow";
import { useWalletVM } from "@components/Wallet/WalletModal/WalletVM";
import styled from "@emotion/styled";
import { SizedBox } from "@src/UIKit/SizedBox";
import { ReactComponent as NotFoundIcon } from "@src/assets/notFound.svg";
import { Button } from "@src/UIKit/Button";
import { Text } from "@src/UIKit/Text";
import { Column } from "@src/common/styles/Flex";
import { useStores } from "@src/stores";
import { Link } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { ROUTES } from "@src/common/constants";

const Root = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 400px;
`;

const Investments: React.FC = () => {
  // const { accountStore, poolsStore, stakeStore } = useStores();
  const vm = useWalletVM();
  return (
    <Root>
      <h2>invesstment</h2>
    </Root>
  );
};
export default observer(Investments);
