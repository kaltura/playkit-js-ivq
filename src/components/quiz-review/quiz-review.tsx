import {h} from 'preact';
import {useCallback, useState, useMemo} from 'preact/hooks';
import {QuizQuestion, QuizTranslates} from '../../types';
import {IvqOverlay} from '../ivq-overlay';
import {Spinner} from '../spinner';
import {QuestionReview, ReviewQuestion} from './question-review';
import {QuestionIcon} from './question-icon';
import * as styles from './quiz-review.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

export interface QuizReviewProps {
  score: number;
  onClose: () => void;
  onRetake?: () => Promise<void>;
  reviewDetails: Array<QuizQuestion>;
  showAnswers: boolean;
  showScores: boolean;
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

export const QuizReview = withText(translates)(
  ({score, onRetake, onClose, reviewDetails, showAnswers, showScores, ...translates}: QuizReviewProps & QuizTranslates) => {
    const [isLoading, setIsLoading] = useState(false);
    const [reviewQuestion, setReviewQuestion] = useState<ReviewQuestion | null>(null);

    const handleQuestionClick = useCallback(
      (qq: QuizQuestion, index: number) => () => {
        setReviewQuestion({
          qq,
          index
        });
      },
      []
    );
    const handleBackClick = useCallback(() => {
      setReviewQuestion(null);
    }, []);
    const handleNavigationClick = useCallback(
      (shift: number) => {
        if (reviewQuestion && reviewDetails[reviewQuestion.index + shift]) {
          return () =>
            setReviewQuestion({
              qq: reviewDetails[reviewQuestion.index + shift],
              index: reviewQuestion.index + shift
            });
        }
      },
      [reviewQuestion, reviewDetails]
    );

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
              <div key={qq.id} role="button" tabIndex={0} onClick={handleQuestionClick(qq, index)} className={styles.reviewAnswer}>
                <div className={styles.questionLabel}>{qq.index + 1}</div>
                <div className={styles.questionContent}>{qq.q.question}</div>
                <QuestionIcon questionType={qq.q.questionType} isCorrect={qq.a?.isCorrect} />
              </div>
            );
          })}
        </div>
      );
    }, [reviewDetails]);
    const renderQuizReview = useMemo(() => {
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
    }, [reviewQuestion, onRetake, onClose, showScores, isLoading]);
    const renderReviewQuestion = useMemo(() => {
      return (
        <QuestionReview
          onBack={handleBackClick}
          onNext={handleNavigationClick(1)}
          onPrev={handleNavigationClick(-1)}
          reviewQuestion={reviewQuestion}
          questionsAmount={reviewDetails.length}
        />
      );
    }, [reviewQuestion, reviewDetails]);
    return <IvqOverlay>{reviewQuestion ? renderReviewQuestion : renderQuizReview}</IvqOverlay>;
  }
);
