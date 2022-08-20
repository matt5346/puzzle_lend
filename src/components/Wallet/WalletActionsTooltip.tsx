import styled from "@emotion/styled";
import React from "react";
import { Column } from "@src/common/styles/Flex";
import { Text } from "@src/UIKit/Text";
import { Anchor } from "@src/UIKit/Anchor";
import Divider from "@src/common/styles/Divider";
import copy from "copy-to-clipboard";
import { observer } from "mobx-react-lite";
import { useStores } from "@src/stores";
import { EXPLORER_URL } from "@src/common/constants";

interface IProps {
  address: string;
}

const Root = styled(Column)`
  .menu-item {
    padding: 10px 0;
    cursor: pointer;

    :first-of-type {
      padding-top: 0;
    }

    :last-of-type {
      padding-bottom: 0;
    }
  }

  .divider {
    margin: 0 -16px;
    width: calc(100% + 32px);
  }
`;

const WalletActionsTooltip: React.FC<IProps> = ({ address }) => {
  const { accountStore } = useStores();

  const handleCopyAddress = () => {
    address && copy(address);
    // notificationStore.notify("Your address was copied", {
    //   type: "success",
    //   title: "Congratulations!",
    // });
  };
  const handleLogout = () => accountStore.logout();

  return (
    <Root>
      <Text onClick={handleCopyAddress} className="menu-item">
        Copy address
      </Text>
      <Anchor
        style={{ padding: "10px 0" }}
        href={`${EXPLORER_URL}/address/${address}`}
      >
        <Text>View in Waves Explorer</Text>
      </Anchor>
      <Divider className="divider" />
      <Text onClick={handleLogout} className="menu-item">
        Disconnect
      </Text>
    </Root>
  );
};
export default observer(WalletActionsTooltip);
