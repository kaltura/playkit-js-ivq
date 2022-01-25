import {h} from 'preact';
import {KalturaNullableBoolean} from '../../providers/response-types';
import * as styles from './welcome-screen.scss';

interface WelcomeScreenProps {
  allowDownload?: KalturaNullableBoolean;
  welcomeMessage?: string;
  onClose: () => void;
}

export const WelcomeScreen = ({allowDownload, welcomeMessage, onClose}: WelcomeScreenProps) => {
  return (
    <div className={styles.welcomeScreen}>
      <div>Welcome screen</div>
      <div>{welcomeMessage}</div>
      <button onClick={onClose}>Start quiz</button>
    </div>
  );
};
