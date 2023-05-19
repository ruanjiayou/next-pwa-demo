import { styled } from 'styled-components';

export const Wrap = styled.div`
  margin: ${props => props.size === 'small' ? 5 : (props.size === 'large' ? 15 : 10)}px;
`

export const IconWrap = styled.span`
  &:hover {
    color: ${props => props.color || '#38b1eb'};
    cursor: pointer;
  }
  &>svg {
    width: ${props => props.size || 16}px;
    height:${props => props.size || 16}px;
  }
`