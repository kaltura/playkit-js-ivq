import {h} from 'preact';
import {KalturaNullableBoolean} from '../../providers/response-types';
import * as styles from './welcome-screen.scss';

const {Overlay} = KalturaPlayer.ui.components;

interface WelcomeScreenProps {
  allowDownload?: KalturaNullableBoolean;
  welcomeMessage?: string;
  onClose: () => void;
}

export const WelcomeScreen = ({allowDownload, welcomeMessage, onClose}: WelcomeScreenProps) => {
  return (
    <Overlay open permanent>
      <div className={styles.welcomeScreenWrapper}>
        <button onClick={onClose}>Start quiz</button>
      </div>
    </Overlay>
  );
};
