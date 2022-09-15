import {h} from 'preact';
import {useMemo, useState, useCallback, useRef, useEffect} from 'preact/hooks';
import {Spinner} from '../../spinner';
import {QuizQuestion} from '../../../types';
import {QuizTranslates, KalturaQuizQuestionTypes} from '../../../types';
import {QuestionIcon} from '../question-icon';
import {A11yWrapper} from '../../a11y-wrapper';
import * as styles from './question-list-review.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;
const {
  redux: {useSelector}
} = KalturaPlayer.ui;

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
    quizCompleted: <Text id="ivq.quiz_completed">You completed the quiz</Text>,
    reviewAnswer: <Text id="ivq.review_answer">Click to view the question and your answer</Text>,
    correctAnswer: <Text id="ivq.correct_answer">The correct answer</Text>,
    incorrectAnswer: <Text id="ivq.incorrect_answer">The incorrect answer</Text>
  };
};

export const QuestionListReview = withText(translates)(
  ({onRetake, score, reviewDetails, showAnswers, showScores, onClose, onQuestionClick, ...otherProps}: QuestionListReviewProps & QuizTranslates) => {
    const [isLoading, setIsLoading] = useState(false);
    const questionsContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const playerNav = useSelector((state: any) => state.shell.playerNav);
      if (!playerNav) {
        return;
      }
      questionsContainerRef.current?.focus();
    }, [questionsContainerRef.current]);

    const handleRetake = useCallback(() => {
      setIsLoading(true);
      onRetake &&
        onRetake().finally(() => {
          setIsLoading(false);
        });
    }, [onRetake]);

    const getQuestionTitle = (qq: QuizQuestion) => {
      if (qq.q.questionType === KalturaQuizQuestionTypes.Reflection) {
        return qq.q.question;
      }
      if (qq.q.questionType === KalturaQuizQuestionTypes.OpenQuestion) {
        return `${otherProps.reviewAnswer}`;
      }
      return `${qq.a?.isCorrect ? otherProps.correctAnswer : otherProps.incorrectAnswer}. ${otherProps.reviewAnswer}`;
    };

    const renderScore = useMemo(() => {
      return <legend data-testid="quizScoreTitle" className={styles.quizScore}>{`${otherProps.quizScore} ${(score * 100).toFixed(0)}/100`}</legend>;
    }, [score]);
    const renderAnswers = useMemo(() => {
      return (
        <div className={styles.questionsContainer} data-testid="reviewQuestionsContainer" role="list" tabIndex={-1} ref={questionsContainerRef}>
          {reviewDetails.map((qq, index) => {
            return (
              <A11yWrapper onClick={onQuestionClick(qq, index)}>
                <div key={qq.id} tabIndex={0} className={styles.reviewAnswer} role="listitem" title={getQuestionTitle(qq)} data-testid="reviewAnswer">
                  <div className={styles.questionLabel} data-testid="reviewQuestionLabel" role="text">
                    {qq.index + 1}
                  </div>
                  <div className={styles.questionContent} role="text" data-testid="reviewQuestionContent">
                    {qq.q.question}
                  </div>
                  <QuestionIcon questionType={qq.q.questionType} isCorrect={qq.a?.isCorrect} />
                </div>
              </A11yWrapper>
            );
          })}
        </div>
      );
    }, [reviewDetails]);
    return (
      <div className={['ivq', styles.quizReviewWrapper].join(' ')} role="dialog" aria-live="polite">
        {showScores ? (
          renderScore
        ) : (
          <div className={styles.quizScore} data-testid="quizScoreTitle">
            {otherProps.quizCompleted}
          </div>
        )}
        <div className={styles.questionsWrapper}>{showAnswers && renderAnswers}</div>
        <div className={styles.buttonWrapper} data-testid="reviewButtonWrapper">
          {onRetake && (
            <button
              onClick={handleRetake}
              className={styles.primaryButton}
              aria-label={otherProps.retakeButtonAreaLabel}
              data-testid="reviewRetakeButton"
              disabled={isLoading}>
              {isLoading ? <Spinner /> : otherProps.retakeButton}
            </button>
          )}
          <button
            onClick={onClose}
            data-testid="reviewDoneButton"
            className={[onRetake ? styles.secondaryButton : styles.primaryButton, isLoading ? styles.disabled : ''].join(' ')}
            aria-label={otherProps.doneButtonAreaLabel}>
            {otherProps.doneButton}
          </button>
        </div>
      </div>
    );
  }
);
