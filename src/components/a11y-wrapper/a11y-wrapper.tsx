import {cloneElement, VNode} from 'preact';
import {OnClick} from '../../types';

const {ENTER, SPACE} = KalturaPlayer.ui.utils.KeyMap;

interface A11yWrapperProps {
  children: VNode;
  onClick: OnClick;
}

export const A11yWrapper = ({children, onClick}: A11yWrapperProps) => {
  return cloneElement(children, {
    onKeyDown: (e: KeyboardEvent) => {
      if ([SPACE, ENTER].includes(e.keyCode)) {
        e.preventDefault();
        onClick(e, true);
      }
    },
    onMouseUp: onClick
  });
};
