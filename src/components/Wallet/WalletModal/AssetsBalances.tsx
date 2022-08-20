import React, { HTMLAttributes } from "react";
import { observer } from "mobx-react-lite";
import { useWalletVM } from "@components/Wallet/WalletModal/WalletVM";
import styled from "@emotion/styled";
// import InvestRow from "@components/InvestRow";
// import { Column } from "@components/Flex";
// import SizedBox from "@components/SizedBox";
// import Text from "@components/Text";
// import Button from "@components/Button";
import { ReactComponent as NotFoundIcon } from "@src/assets/notFound.svg";
import { useStores } from "@src/stores";
import Skeleton from "react-loading-skeleton";

interface IProps extends HTMLAttributes<HTMLDivElement> {}

const Root = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 400px;
`;

const AssetsBalances: React.FC<IProps> = () => {
  const vm = useWalletVM();
  const { accountStore } = useStores();
  if (accountStore.assetBalances === null)
    return (
      <Root style={{ padding: "0 24px" }}>
        <Skeleton height={56} style={{ marginBottom: 8 }} count={3} />
      </Root>
    );
  return (
    <Root>
      <h2>acc balance</h2>
    </Root>
  );
};
export default observer(AssetsBalances);
