import {h} from 'preact';
import {useMemo, useState, useCallback} from 'preact/hooks';
import {Spinner} from '../../spinner';
import {QuizQuestion} from '../../../types';
import {QuizTranslates} from '../../../types';
import {QuestionIcon} from '../question-icon';
import {A11yWrapper} from '../../a11y-wrapper';
import * as styles from './question-list-review.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

export interface QuestionListReviewProps {
  onRetake?: () => Promise<void>;
  score: number;
  onClose: () => void;
  showAnswers: boolean;
  showScores: boolean;
  reviewDetails: Array<QuizQuestion>;
  onQuestionClick: (qq: QuizQuestion, index: number) => () => void;
}

const translates = (): QuizTranslates => {
  return {
    quizScore: <Text id="ivq.quiz_score">Your score is</Text>,
    retakeButton: <Text id="ivq.retake_button">Retake</Text>,
    retakeButtonAreaLabel: <Text id="ivq.retake_button_area_label">Click to retake the quiz</Text>,
    doneButton: <Text id="ivq.done_button">Done</Text>,
    doneButtonAreaLabel: <Text id="ivq.done_button_area_label">Click to close the review</Text>,
    quizCompleted: <Text id="ivq.quiz_completed">You completed the quiz</Text>
  };
};

export const QuestionListReview = withText(translates)(
  ({onRetake, score, reviewDetails, showAnswers, showScores, onClose, onQuestionClick, ...translates}: QuestionListReviewProps & QuizTranslates) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleRetake = useCallback(() => {
      setIsLoading(true);
      onRetake &&
        onRetake().finally(() => {
          setIsLoading(false);
        });
    }, [onRetake]);

    const renderScore = useMemo(() => {
      return <div className={styles.quizScore}>{`${translates.quizScore} ${(score * 100).toFixed(0)}/100`}</div>;
    }, [score]);
    const renderAnswers = useMemo(() => {
      return (
        <div className={styles.questionsContainer}>
          {reviewDetails.map((qq, index) => {
            return (
              <A11yWrapper onClick={onQuestionClick(qq, index)}>
                <div key={qq.id} role="button" tabIndex={0} className={styles.reviewAnswer}>
                  <div className={styles.questionLabel}>{qq.index + 1}</div>
                  <div className={styles.questionContent}>{qq.q.question}</div>
                  <QuestionIcon questionType={qq.q.questionType} isCorrect={qq.a?.isCorrect} />
                </div>
              </A11yWrapper>
            );
          })}
        </div>
      );
    }, [reviewDetails]);
    return (
      <div className={styles.quizReviewWrapper}>
        {showScores ? renderScore : <div className={styles.quizScore}>{translates.quizCompleted}</div>}
        <div className={styles.questionsWrapper}>{showAnswers && renderAnswers}</div>
        <div className={styles.buttonWrapper}>
          {onRetake && (
            <button onClick={handleRetake} className={styles.primaryButton} aria-label={translates.retakeButtonAreaLabel} disabled={isLoading}>
              {isLoading ? <Spinner /> : translates.retakeButton}
            </button>
          )}
          <button
            onClick={onClose}
            className={[onRetake ? styles.secondaryButton : styles.primaryButton, isLoading ? styles.disabled : ''].join(' ')}
            aria-label={translates.doneButtonAreaLabel}>
            {translates.doneButton}
          </button>
        </div>
      </div>
    );
  }
);
