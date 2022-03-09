import {h} from 'preact';
import {KalturaNullableBoolean} from '../../providers/response-types';
import * as styles from './welcome-screen.scss';
import {QuizTranslates} from '../../types';
import {icons} from '../icons';
const {withText, Text} = KalturaPlayer.ui.preacti18n;
const {Icon} = KalturaPlayer.ui.components;

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

export const WelcomeScreen = withText(translates)(({allowDownload, welcomeMessage, onDownload}: WelcomeScreenProps) => {
  return (
    <div className={styles.welcomeScreenWrapper}>
      <div className={styles.background} />
      <div className={styles.content}>
        <div className={styles.title}>{translates.welcomeTitle}</div>
        <div className={styles.desc}>{welcomeMessage}</div>
        {allowDownload && (
          <div tabIndex={0} role="button" aria-label={translates.welcomeDownload} onClick={onDownload} className={styles.download}>
            <div className={styles.icon}>
              <Icon
                id="ivq-download"
                height={icons.MediumSize}
                width={icons.MediumSize}
                viewBox={`0 0 ${icons.MediumSize} ${icons.MediumSize}`}
                path={icons.DOWNLOAD}
              />
            </div>

            {translates.welcomeDownload}
          </div>
        )}
      </div>
    </div>
  );
});
