import {h} from 'preact';
import {useCallback, useState, useEffect} from 'preact/hooks';

import {KalturaNullableBoolean} from '../../providers/response-types';
import * as styles from './welcome-screen.scss';
import {QuizTranslates} from '../../types';
import {icons} from '../icons';
import {Spinner} from '../spinner';
import {A11yWrapper} from '../a11y-wrapper';
const {withText, Text} = KalturaPlayer.ui.preacti18n;
const {Icon} = KalturaPlayer.ui.components;

const translates: QuizTranslates = {
  welcomeTitle: <Text id="ivq.welcome_title">Start your video quiz!</Text>,
  welcomeDownload: <Text id="ivq.welcome_download">Download Pre-Test</Text>
};

interface WelcomeScreenProps {
  allowDownload?: KalturaNullableBoolean;
  welcomeMessage?: string;
  onDownload: () => Promise<void>;
}

export const WelcomeScreen = withText(translates)(
  ({allowDownload, welcomeMessage, onDownload, ...otherProps}: WelcomeScreenProps & QuizTranslates) => {
    const [isLoading, setLoading] = useState(false);
    const handleDownload = useCallback(() => {
      if (!isLoading) {
        setLoading(true);
        onDownload().finally(() => {
          setLoading(false);
        });
      }
    }, [onDownload, isLoading]);

    return (
      <div className={styles.welcomeScreenWrapper} role="dialog" aria-live="polite">
        <div className={styles.background} />
        <div className={styles.content} data-testid="welcomeScreenContent">
          <div role="heading">
            <div className={styles.title} data-testid="welcomeScreenTitle">{otherProps.welcomeTitle}</div>
            <div className={styles.desc} data-testid="welcomeScreenDescription">{welcomeMessage}</div>
          </div>
          {allowDownload && (
            <A11yWrapper onClick={handleDownload}>
              <div
                tabIndex={0}
                role="button"
                aria-label={otherProps.welcomeDownload}
                data-testid="downloadPreTestContainer"
                className={[styles.download, isLoading ? styles.disabled : ''].join(' ')}>
                {isLoading && (
                  <div className={styles.spinnerContainer}>
                    <Spinner height="20px" width="20px" />
                  </div>
                )}
                {!isLoading && (
                  <div className={styles.icon} data-testid="downloadPreTestIcon">
                    <Icon
                      id="ivq-download"
                      data-testid="downloadPreTestIcon"
                      height={icons.MediumSize}
                      width={icons.MediumSize}
                      viewBox={`0 0 ${icons.MediumSize} ${icons.MediumSize}`}
                      path={icons.DOWNLOAD}
                    />
                  </div>
                )}
                <span>{otherProps.welcomeDownload}</span>
              </div>
            </A11yWrapper>
          )}
        </div>
      </div>
    );
  }
);
