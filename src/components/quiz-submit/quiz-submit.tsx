import {h} from 'preact';
import {useCallback, useState} from 'preact/hooks';
import {QuizTranslates} from '../../types';
import {IvqOverlay} from '../ivq-overlay';
import {Spinner} from '../spinner';
import * as styles from './quiz-submit.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

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

export const QuizSubmit = withText(translates)(({onReview, onSubmit, ...translates}: QuizSubmitProps & QuizTranslates) => {
  const [isLoading, setIsLoading] = useState(false);
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
      <div className={styles.quizSubmitWrapper}>
        <div className={styles.title}>{translates.title}</div>
        <div className={styles.description}>{translates.description}</div>
        <div className={styles.buttonWrapper}>
          {onSubmit && (
            <button onClick={handleSubmitClick} className={styles.primaryButton} aria-label={translates.submitButtonAriaLabel} disabled={isLoading}>
              {isLoading ? <Spinner /> : translates.submitButton}
            </button>
          )}
          <button
            onClick={handleReviewClick}
            disabled={isLoading}
            className={[onSubmit ? styles.secondaryButton : styles.primaryButton, isLoading ? styles.disabled : ''].join(' ')}
            aria-label={translates.reviewButtonAriaLabel}>
            {translates.reviewButton}
          </button>
        </div>
      </div>
    </IvqOverlay>
  );
});
