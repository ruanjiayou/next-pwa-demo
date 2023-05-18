import { styled } from 'styled-components';

export const Wrap = styled.div`
  margin: ${props => props.size === 'small' ? 5 : (props.size === 'large' ? 15 : 10)}px;
`