import {h, VNode} from 'preact';
import * as styles from './ivq-overlay.scss';

const {Overlay} = KalturaPlayer.ui.components;

interface IvqOverlayProps {
  children: VNode | VNode[];
}

export const IvqOverlay = ({children}: IvqOverlayProps) => {
  return (
    <div className={styles.ivqOverlay} role="dialog" aria-labelledby="dialogTitle" aria-live="polite">
      <Overlay open permanent>
        {children}
      </Overlay>
    </div>
  );
};
