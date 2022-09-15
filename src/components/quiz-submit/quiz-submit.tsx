import {h} from 'preact';
import {useCallback, useState, useRef, useEffect} from 'preact/hooks';
import {QuizTranslates} from '../../types';
import {IvqOverlay} from '../ivq-overlay';
import {Spinner} from '../spinner';
import * as styles from './quiz-submit.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

const {
  redux: {useSelector}
} = KalturaPlayer.ui;

export interface QuizSubmitProps {
  onReview: () => void;
  onSubmit?: () => Promise<void>;
}

const translates = ({onSubmit}: QuizSubmitProps): QuizTranslates => {
  return {
    submitButton: <Text id="ivq.submit_button">Submit</Text>,
    submitButtonAriaLabel: <Text id="ivq.submit_button_area_label">Click to submit quiz</Text>,
    reviewButton: <Text id="ivq.review_button">Review</Text>,
    reviewButtonAriaLabel: <Text id="ivq.review_button_area_label">Click to review quiz</Text>,
    title: onSubmit ? <Text id="ivq.submit_title">Quiz Completed</Text> : <Text id="ivq.review_title">You Almost Done</Text>,
    description: onSubmit ? (
      <Text id="ivq.submit_description">Take a moment to review your answers or go ahead and submit</Text>
    ) : (
      <Text id="ivq.review_description">It appears that some questions remained unanswered You must answer all questions before you can submit</Text>
    )
  };
};

export const QuizSubmit = withText(translates)(({onReview, onSubmit, ...otherProps}: QuizSubmitProps & QuizTranslates) => {
  const [isLoading, setIsLoading] = useState(false);
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  const reviewButtonRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const playerNav = useSelector((state: any) => state.shell.playerNav);
    if (!playerNav) {
      return;
    }
    if (onSubmit) {
      submitButtonRef.current?.focus();
    } else {
      reviewButtonRef.current?.focus();
    }
  }, [onSubmit]);
  const handleReviewClick = useCallback(() => {
    onReview();
  }, [onReview]);
  const handleSubmitClick = useCallback(() => {
    if (onSubmit) {
      setIsLoading(true);
      onSubmit().finally(() => {
        setIsLoading(false);
      });
    }
  }, []);
  return (
    <IvqOverlay>
      <div className={['ivq', styles.quizSubmitWrapper].join(' ')} data-testid="submitContainer" role="dialog" aria-live="polite">
        <div>
          <div className={styles.title}>{otherProps.title}</div>
          <div className={styles.description}>{otherProps.description}</div>
        </div>
        <div className={styles.buttonWrapper} data-testid="submitButton">
          {onSubmit && (
            <button
              onClick={handleSubmitClick}
              className={styles.primaryButton}
              aria-label={otherProps.submitButtonAriaLabel}
              disabled={isLoading}
              ref={submitButtonRef}>
              {isLoading ? <Spinner /> : otherProps.submitButton}
            </button>
          )}
          <button
            onClick={handleReviewClick}
            disabled={isLoading}
            className={[onSubmit ? styles.secondaryButton : styles.primaryButton, isLoading ? styles.disabled : ''].join(' ')}
            aria-label={otherProps.reviewButtonAriaLabel}
            ref={reviewButtonRef}>
            {otherProps.reviewButton}
          </button>
        </div>
      </div>
    </IvqOverlay>
  );
});
