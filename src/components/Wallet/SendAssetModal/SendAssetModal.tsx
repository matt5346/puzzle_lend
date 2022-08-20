import React from 'react';
import './send-asset.css';
import { IDialogPropTypes } from 'rc-dialog/lib/IDialogPropTypes';
import RcDialog from 'rc-dialog';
import { observer, Observer } from 'mobx-react-lite';
import { useStores } from '@src/stores';
import SquareTokenIcon from '@src/common/styles/SquareTokenIcon';
import { SizedBox } from '@src/UIKit/SizedBox';
import { Text } from '@src/UIKit/Text';
import BN from '@src/common/utils/BN';
import { Column } from '@src/common/styles/Flex';
import { SendAssetVMProvider } from '@components/Wallet/SendAssetModal/SendAssetVM';
import RecipientInfo from '@components/Wallet/SendAssetModal/RecipientInfo';
import { ReactComponent as CloseIcon } from '@src/assets/icons/darkClose.svg';
import SendAssetHeader from './SendAssetHeader';

type IProps = IDialogPropTypes;

const SendAssetModal: React.FC<IProps> = ({ ...rest }) => {
  const { accountStore } = useStores();
  const { assetToSend } = accountStore;
  const balance = BN.formatUnits(assetToSend?.balance ?? 0, assetToSend?.decimals);
  return (
    <RcDialog
      wrapClassName="send-asset"
      closeIcon={<CloseIcon style={{ cursor: 'pointer' }} />}
      title={<SendAssetHeader tokenName={`Send ${assetToSend?.name}`} onClose={rest.onClose} />}
      destroyOnClose
      {...rest}>
      <Observer>
        {() => (
          <SendAssetVMProvider>
            <Column
              justifyContent="center"
              alignItems="center"
              crossAxisSize="max"
              mainAxisSize="stretch"
              style={{ position: 'relative' }}>
              <SizedBox height={24} />
              <SquareTokenIcon src={assetToSend?.logo} />
              <SizedBox height={8} />
              <Text fitContent weight={500}>{`${balance?.toFormat(2)} ${assetToSend?.symbol}`}</Text>
              <Text fitContent type="secondary">{`$ ${assetToSend?.usdnEquivalent?.toFormat(2)}`}</Text>
              <RecipientInfo />
            </Column>
          </SendAssetVMProvider>
        )}
      </Observer>
    </RcDialog>
  );
};
export default observer(SendAssetModal);