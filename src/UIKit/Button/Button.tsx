import styled from '@emotion/styled';

type TButtonType = 'primary' | 'secondary';
type TButtonSize = 'medium' | 'large';

const Button = styled.button<{
  kind?: TButtonType;
  size?: TButtonSize;
  fixed?: boolean;
}>`
  white-space: nowrap;
  display: flex;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  background: ${({ kind }) => (kind === 'secondary' ? '#7075e9' : '#fff')};
  border: 1px solid ${({ kind }) => (kind === 'secondary' ? '#7075e9' : '#F1F2FE')};
  border-radius: 2px;
  box-shadow: none;
  font-weight: 500;
  font-size: 16px;
  line-height: 24px;
  color: ${({ kind }) => (kind === 'secondary' ? '#fff' : '#7075E9')};
  width: ${({ fixed }) => (fixed ? '100%' : 'fit-content')};
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
    background: ${({ kind }) => (kind === 'secondary' ? '#6563dd' : '#F1F2FE')};
    border: 1px solid ${({ kind }) => (kind === 'secondary' ? '#6563dd' : '#F1F2FE')};
    color: ${({ kind }) => kind === 'secondary' && '#F1F2FE'};
  }

  :disabled {
    opacity: ${({ kind }) => (kind === 'secondary' ? 0.4 : 1)};
    background: ${({ kind }) => (kind === 'secondary' ? '#c6c9f4' : '#fff')};
    border: 1px solid ${({ kind }) => (kind === 'secondary' ? '#c6c9f4' : '#F1F2FE')};
    cursor: not-allowed;
  }
`;

export default Button;
