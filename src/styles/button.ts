import { css } from '@emotion/react';

import { dark } from './variables';

export const formControlCss = css`
  align-items: center;
  background-color: transparent;
  border-radius: var(--border-radius);
  border: 1px solid ${dark};
  box-sizing: border-box;
  color: var(--text) !important;
  cursor: pointer;
  display: flex;
  font-size: var(--font-size);
  gap: calc(var(--gutter) / 2);
  justify-content: center;
  padding: calc(var(--gutter) / 2) var(--gutter);
  text-decoration: none !important;
  transition: all 0.15s ease-in-out;
  width: 100%;
  &:focus {
    box-shadow: 0 0 0 0.25rem var(--focus);
  }
`;

export const buttonCss = css`
  ${formControlCss}
  overflow: hidden;
  user-select: none;
  white-space: nowrap;

  svg {
    display: block;
  }

  :hover,
  &[data-active='true'] {
    background-color: ${dark};
    color: var(--background) !important;
  }
`;

export const dropdownButtonCss = css`
  ${buttonCss}
  ::after {
    border-bottom: 0;
    border-left: 0.3em solid transparent;
    border-right: 0.3em solid transparent;
    border-top: 0.3em solid;
    content: '';
    display: inline-block;
    vertical-align: 0.255em;
  }
`;
