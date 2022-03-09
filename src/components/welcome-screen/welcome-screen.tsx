import {h} from 'preact';
import {KalturaNullableBoolean} from '../../providers/response-types';
import * as styles from './welcome-screen.scss';
import {QuizTranslates} from '../../types';
const {withText, Text} = KalturaPlayer.ui.preacti18n;

const translates: QuizTranslates = {
  welcomeTitle: <Text id="ivq.welcome_title">Start your video quiz!</Text>,
  welcomeDownload: <Text id="ivq.welcome_download">Download Pre-Test</Text>
};

interface WelcomeScreenProps {
  allowDownload?: KalturaNullableBoolean;
  welcomeMessage?: string;
  onDownload: () => void;
  onClose: () => void;
}
const DownloadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 3C12.5128 3 12.9355 3.38604 12.9933 3.88338L13 4V11.5852L15.2929 9.29289C15.6534 8.93241 16.2206 8.90468 16.6129 9.20971L16.7071 9.2929C17.0676 9.65339 17.0953 10.2206 16.7903 10.6129L16.7071 10.7071L12.7151 14.699C12.6845 14.7304 12.6518 14.7597 12.6173 14.7868C12.5589 14.8327 12.4965 14.8713 12.4315 14.9024C12.3009 14.9649 12.1545 15 12 15L11.9845 14.9999C11.8694 14.9981 11.759 14.9769 11.6564 14.9394C11.5612 14.9047 11.4702 14.8549 11.387 14.7903L11.3856 14.789C11.3533 14.7638 11.3225 14.7367 11.2936 14.7078L11.2928 14.7071L7.29289 10.7071C6.90237 10.3166 6.90237 9.6834 7.2929 9.29289C7.65339 8.93241 8.22062 8.90468 8.61291 9.20971L8.70711 9.2929L11 11.5852V4C11 3.44772 11.4477 3 12 3Z"
      fill="white"
    />
    <path d="M4 18C3.44772 18 3 18.4477 3 19C3 19.5523 3.44772 20 4 20H20C20.5523 20 21 19.5523 21 19C21 18.4477 20.5523 18 20 18H4Z" fill="white" />
  </svg>
);
export const WelcomeScreen = withText(translates)(({allowDownload, welcomeMessage, onDownload}: WelcomeScreenProps) => {
  return (
    <div className={styles.welcomeScreenWrapper}>
      <div className={styles.background} />
      <div className={styles.content}>
        <div className={styles.title}>{translates.welcomeTitle}</div>
        <div className={styles.desc}>{welcomeMessage}</div>
        {allowDownload && (
          <div tabIndex={0} role="button" aria-label={translates.welcomeDownload} onClick={onDownload} className={styles.download}>
            <DownloadIcon />
            {translates.welcomeDownload}
          </div>
        )}
      </div>
    </div>
  );
});
