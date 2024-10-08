import {h} from 'preact';
import {useCallback, useState, useMemo} from 'preact/hooks';

import * as styles from './welcome-screen.scss';
import {QuizTranslates} from '../../types';
import {icons} from '../icons';
import {Spinner} from '../spinner';
import {A11yWrapper} from '@playkit-js/common/dist/hoc/a11y-wrapper';
const {withText, Text} = KalturaPlayer.ui.preacti18n;
const {Icon} = KalturaPlayer.ui.components;
const {Overlay} = KalturaPlayer.ui.components;

export interface WelcomeScreenProps {
  welcomeMessage?: string;
  inVideoTip?: boolean;
  onDownload?: () => Promise<void>;
  onClose?: () => void;
  poster?: string;
  availableAttempts?: number;
}
const translates = ({availableAttempts}: WelcomeScreenProps): QuizTranslates => {
  return {
    welcomeTitle: <Text id="ivq.welcome_title">Start your video quiz!</Text>,
    tip: <Text id="ivq.tip">All questions must be answered. The quiz will be submitted at the end.</Text>,
    availableAttemptsMessage: (
      <Text
        id="ivq.available_attempts_message"
        fields={{
          availableAttempts: availableAttempts
        }}>{`Total attempts available for this quiz: ${availableAttempts}`}</Text>
    ),
    welcomeDownload: <Text id="ivq.welcome_download">Download Pre-Test</Text>,
    startQuiz: <Text id="ivq.start_quiz">Start Quiz</Text>
  };
};

export const WelcomeScreen = withText(translates)(
  ({welcomeMessage, inVideoTip, onDownload, poster, onClose, availableAttempts, ...otherProps}: WelcomeScreenProps & QuizTranslates) => {
    const [isLoading, setLoading] = useState(false);
    const handleDownload = useCallback(() => {
      if (!isLoading) {
        setLoading(true);
        onDownload!().finally(() => {
          setLoading(false);
        });
      }
    }, [onDownload, isLoading]);

    const renderWelcomeScreen = useMemo(
      () => (
        <div
          data-testid="welcomeScreenRoot"
          className={['ivq', styles.welcomeScreenWrapper, poster ? styles.withPoster : ''].join(' ')}
          style={{backgroundImage: poster ? `url(${poster})` : 'none'}}>
          <div className={styles.background} />
          <div className={styles.content} data-testid="welcomeScreenContent">
            <div
              title={`${otherProps.welcomeTitle}. ${welcomeMessage}. ${otherProps.tip} ${otherProps.availableAttemptsMessage}`}
              tabIndex={0}
              aria-live="polite">
              <div className={styles.title} data-testid="welcomeScreenTitle">
                {otherProps.welcomeTitle}
              </div>
              <div className={styles.desc} data-testid="welcomeScreenDescription">
                {welcomeMessage}
              </div>
              {inVideoTip ? (
                <div className={styles.tip} data-testid="welcomeScreenTip">
                  {otherProps.tip}
                </div>
              ) : (
                ''
              )}
              {availableAttempts && availableAttempts > 0 ? (
                <div className={styles.attempts} data-testid="welcomeScreenAttempts">
                  {otherProps.availableAttemptsMessage}
                </div>
              ) : (
                ''
              )}
            </div>
            <div className={styles.buttonWrapper}>
              {onClose && (
                <A11yWrapper onClick={onClose}>
                  <div data-testid="startQuiz" aria-label={otherProps.startQuiz} className={styles.startQuizButton} tabIndex={0}>
                    {otherProps.startQuiz}
                  </div>
                </A11yWrapper>
              )}
              {onDownload && (
                <A11yWrapper onClick={handleDownload}>
                  <div
                    tabIndex={0}
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
        </div>
      ),
      []
    );
    // TODO: check why Overlay component is not being rendered under OverlayPortal component
    return onClose ? <Overlay open permanent children={renderWelcomeScreen} dontCheckOverlayPortal /> : renderWelcomeScreen;
  }
);
