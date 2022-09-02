import React from 'react';
import { ReactComponent as CheckedCheckbox } from '@src/common/assets/icons/checked.svg';
import { ReactComponent as NoCheckedCheckbox } from '@src/common/assets/icons/noChecked.svg';
import { Row } from '@src/common/styles/Flex';
import { Text } from '@src/UIKit/Text';
import { SizedBox } from '@src/UIKit/SizedBox';

interface IProps {
  checked: boolean;
  label: string;
  onChange: (v: boolean) => void;
}

const Checkbox: React.FC<IProps> = ({ checked, label, onChange }) => {
  return checked ? (
    <Row style={{ cursor: 'pointer' }} onClick={() => onChange(false)}>
      <CheckedCheckbox
        style={{
          position: 'relative',
          top: '3px',
        }}
      />
      <SizedBox width={8} />
      <Text size="medium">{label}</Text>
    </Row>
  ) : (
    <Row style={{ cursor: 'pointer' }} onClick={() => onChange(true)}>
      <NoCheckedCheckbox
        style={{
          position: 'relative',
          top: '3px',
        }}
      />
      <SizedBox width={8} />
      <Text size="medium">{label}</Text>
    </Row>
  );
};
export default Checkbox;
