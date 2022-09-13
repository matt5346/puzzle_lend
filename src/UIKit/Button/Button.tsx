import styled from '@emotion/styled';

type TButtonType = 'primary' | 'secondary' | 'error';
type TButtonSize = 'medium' | 'large';

const Button = styled.button<{
  kind?: TButtonType;
  size?: TButtonSize;
  minWidth?: string;
  maxWidth?: string;
  fixed?: boolean;
}>`
  white-space: nowrap;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  ${({ kind }) =>
    (() => {
      switch (kind) {
        case 'primary':
          return 'background: #7075e9;';
        case 'secondary':
          return 'background: #fff;';
        case 'error':
          return 'background: #fca1a1!important;';
        default:
          return 'background: #7075e9;';
      }
    })()}
  border: 1px solid ${({ kind }) => (kind === 'secondary' ? '#F1F2FE' : '#7075e9')};
  border-radius: 12px;
  box-shadow: none;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: ${({ kind }) => (kind === 'secondary' ? '#7075E9' : '#ffffff')};
  width: ${({ fixed }) => (fixed ? '100%' : 'fit-content')};
  min-width: ${({ minWidth }) => minWidth || 'unset'};
  max-width: ${({ maxWidth }) => maxWidth || 'unset'};
  transition: 0.4s;
  ${({ size }) =>
    (() => {
      switch (size) {
        case 'medium':
          return 'padding: 0 20px; height: 40px;';
        case 'large':
          return 'padding: 0 24px; height: 56px;';
        default:
          return 'padding: 0 24px; height: 56px;';
      }
    })()}

  :hover {
    cursor: pointer;
    background: ${({ kind }) => (kind === 'secondary' ? '#F1F2FE' : '#6563dd')};
    border: 1px solid ${({ kind }) => (kind === 'secondary' ? '#F1F2FE' : '#6563dd')};
    color: ${({ kind }) => kind === 'secondary' && '#6563DD'};
  }

  :disabled {
    opacity: ${({ kind }) => (kind === 'secondary' ? 0.4 : 1)};
    background: ${({ kind }) => (kind === 'secondary' ? '#fff' : '#c6c9f4')};
    border: 1px solid ${({ kind }) => (kind === 'secondary' ? '#F1F2FE' : '#c6c9f4')};
    cursor: not-allowed;
  }

  svg {
    margin-right: 10px;
  }
`;

export default Button;
