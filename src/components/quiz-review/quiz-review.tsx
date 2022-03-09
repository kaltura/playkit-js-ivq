import {h} from 'preact';
import {useCallback, useState, useMemo} from 'preact/hooks';
import {KalturaQuizQuestionTypes, QuizQuestion, QuizTranslates} from '../../types';
import {icons} from '../icons';
import {IvqOverlay} from '../ivq-overlay';
import * as styles from './quiz-review.scss';

const {Icon} = KalturaPlayer.ui.components;
const {withText, Text} = KalturaPlayer.ui.preacti18n;

export interface QuizReviewProps {
  score: number;
  onClose: () => void;
  onRetake?: () => void;
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

const renderIncorrectAnswerIcon = () => (
  <Icon
    id="ivq-question-incorrect-answer"
    height={icons.SmallSize}
    width={icons.SmallSize}
    viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`}
    path={icons.INCORRECT_ANSWER}
  />
);
const renderCorrectAnswerIcon = () => (
  <Icon
    id="ivq-question-correct-answer"
    height={icons.SmallSize}
    width={icons.SmallSize}
    viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`}
    path={icons.CORRCT_ANSWER}
  />
);
const renderOpenQuestionIcon = () => (
  <Icon
    id="ivq-open-question"
    height={icons.SmallSize}
    width={icons.SmallSize}
    viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`}
    path={icons.OPEN_QUESTION_ICON}
  />
);
const renderReflectionPointIcon = () => (
  <Icon
    id="ivq-reflectin-point"
    height={icons.SmallSize}
    width={icons.SmallSize}
    viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`}
    path={icons.REFLECTION_POINT_ICON}
  />
);

const renderQuestionIcon = (qq: QuizQuestion) => {
  switch (qq.q.questionType) {
    case KalturaQuizQuestionTypes.OpenQuestion:
      return [renderOpenQuestionIcon(), styles.defaultIcon];
    case KalturaQuizQuestionTypes.Reflection:
      return [renderReflectionPointIcon(), styles.defaultIcon];
    default:
      return qq.a?.isCorrect ? [renderCorrectAnswerIcon(), styles.correctAnswer] : [renderIncorrectAnswerIcon(), styles.incorrectAnswer];
  }
};

export const QuizReview = withText(translates)(
  ({score, onRetake, onClose, reviewDetails, showAnswers, showScores, ...translates}: QuizReviewProps & QuizTranslates) => {
    const handleQuestionClick = useCallback(
      (qq: QuizQuestion) => () => {
        // TODO: handle review of question
      },
      []
    );
    const renderScore = useMemo(() => {
      return <div className={styles.quizScore}>{`${translates.quizScore} ${(score * 100).toFixed(0)}/100`}</div>;
    }, [score]);
    const renderAnswers = useMemo(() => {
      return (
        <div className={styles.questionsContainer}>
          {reviewDetails.map(qq => {
            const [questionIcon, questionIconStyles] = renderQuestionIcon(qq);
            return (
              <div key={qq.id} role="button" tabIndex={0} onClick={handleQuestionClick(qq)} className={styles.reviewAnswer}>
                <div className={styles.questionLabel}>{qq.index + 1}</div>
                <div className={styles.questionContent}>{qq.q.question}</div>
                <div className={[styles.questionIcon, questionIconStyles].join(' ')}>{questionIcon}</div>
              </div>
            );
          })}
        </div>
      );
    }, [reviewDetails]);
    return (
      <IvqOverlay>
        <div className={styles.quizReviewWrapper}>
          {showScores ? renderScore : <div className={styles.quizScore}>{translates.quizCompleted}</div>}
          <div className={styles.questionsWrapper}>{showAnswers && renderAnswers}</div>
          <div className={styles.buttonWrapper}>
            {onRetake && (
              <button onClick={onRetake} className={styles.primaryButton} aria-label={translates.retakeButtonAreaLabel}>
                {translates.retakeButton}
              </button>
            )}
            <button
              onClick={onClose}
              className={onRetake ? styles.secondaryButton : styles.primaryButton}
              aria-label={translates.doneButtonAreaLabel}>
              {translates.doneButton}
            </button>
          </div>
        </div>
      </IvqOverlay>
    );
  }
);
