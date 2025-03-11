import { h, VNode } from 'preact';
import * as styles from './ivq-overlay.scss';
import { OverlayPortal } from '@playkit-js/common/dist/hoc/overlay-portal';
import {FocusTrap} from '@playkit-js/common/dist/components/focus-trap';
const { Overlay } = KalturaPlayer.ui.components;

interface IvqOverlayProps {
  children: VNode | VNode[];
}

export const IvqOverlay = ({ children }: IvqOverlayProps) => {
  return (
    <OverlayPortal>
      <FocusTrap active>
        <div className={styles.ivqOverlay} aria-live="polite">
          <Overlay open permanent>
            {children}
          </Overlay>
        </div>
      </FocusTrap>
    </OverlayPortal>
  );
};
