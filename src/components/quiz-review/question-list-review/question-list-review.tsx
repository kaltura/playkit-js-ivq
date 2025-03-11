import {h} from 'preact';
import {useMemo, useState, useCallback} from 'preact/hooks';
import {Spinner} from '../../spinner';
import {QuizQuestion} from '../../../types';
import {QuizTranslates, KalturaQuizQuestionTypes} from '../../../types';
import {QuestionIcon} from '../question-icon';
import {A11yWrapper} from '@playkit-js/common/dist/hoc/a11y-wrapper';
import { FocusTrap } from '@playkit-js/common/dist/components/focus-trap';
import * as styles from './question-list-review.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

export interface QuestionListReviewProps {
  onRetake?: () => Promise<void>;
  score: string;
  onClose: () => void;
  showAnswers: boolean;
  showScores: boolean;
  reviewDetails: Array<QuizQuestion>;
  onQuestionClick: (qq: QuizQuestion, index: number) => () => void;
}

const translates = ({score}: QuestionListReviewProps): QuizTranslates => {
  return {
    quizScore: (
      <Text
        id="ivq.quiz_score"
        fields={{
          quizScore: `${score}/100`
        }}>
        {`Your score is ${score}/100`}
      </Text>
    ),
    retakeButton: <Text id="ivq.retake_button">Retake</Text>,
    retakeButtonAreaLabel: <Text id="ivq.retake_button_area_label">Click to retake the quiz</Text>,
    closeButton: <Text id="ivq.close_button">Close</Text>,
    closeButtonAriaLabel: <Text id="ivq.close_button_aria_label">Click to close the review</Text>,
    quizCompleted: <Text id="ivq.quiz_completed">You completed the quiz</Text>,
    reviewQuestion: <Text id="ivq.review_question">Click to review the question</Text>,
    correctAnswer: <Text id="ivq.correct_answer">Correct answer</Text>,
    wrongAnswer: <Text id="ivq.wrong_answer">Wrong answer</Text>,
    reflectionPointTranslate: <Text id="ivq.reflection_point">Reflection Point</Text>,
    questionLabel: <Text id="ivq.question">Question</Text>
  };
};

export const QuestionListReview = withText(translates)(
  ({onRetake, score, reviewDetails, showAnswers, showScores, onClose, onQuestionClick, ...otherProps}: QuestionListReviewProps & QuizTranslates) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleRetake = useCallback(() => {
      setIsLoading(true);
      onRetake &&
        onRetake().finally(() => {
          setIsLoading(false);
        });
    }, [onRetake]);

    const getQuestionIndex = (qq: QuizQuestion) => {
      return `${otherProps.questionLabel} #${qq.index + 1}`;
    };

    const getQuestionLabel = (qq: QuizQuestion) => {
      if (qq.q.questionType === KalturaQuizQuestionTypes.Reflection) {
        return `${getQuestionIndex(qq)}, ${otherProps.reflectionPointTranslate}: ${qq.q.question}`;
      }
      if (qq.q.questionType === KalturaQuizQuestionTypes.OpenQuestion) {
        return `${getQuestionIndex(qq)}, ${qq.q.question}. ${otherProps.reviewQuestion}`;
      }
      return `${getQuestionIndex(qq)}: ${qq.a?.isCorrect ? otherProps.correctAnswer : otherProps.wrongAnswer}, ${qq.q.question}. ${
        otherProps.reviewQuestion
      }`;
    };

    const renderAnswers = useMemo(() => {
      return (
        <div className={styles.questionsContainer} data-testid="reviewQuestionsContainer" role="listbox">
          {reviewDetails.map((qq, index) => {
            return (
              <A11yWrapper onClick={onQuestionClick(qq, index)} role="listitem">
                <div key={qq.id} tabIndex={0} className={styles.reviewAnswer} data-testid="reviewAnswer">
                  <div className={styles.questionLabel} data-testid="reviewQuestionLabel" aria-hidden="true">
                    {qq.index + 1}
                  </div>
                  <div className={styles.questionContent} data-testid="reviewQuestionContent" aria-hidden="true">
                    {qq.q.question}
                  </div>
                  <span className={styles.visuallyHidden}>{getQuestionLabel(qq)}</span>
                  <QuestionIcon questionType={qq.q.questionType} isCorrect={qq.a?.isCorrect} />
                </div>
              </A11yWrapper>
            );
          })}
        </div>
      );
    }, [reviewDetails]);
    return (
      <FocusTrap active>
        <div className={['ivq', styles.quizReviewWrapper].join(' ')} role="dialog" aria-live="polite" data-testid="quizReviewWrapper">
          {showScores ? (
            <legend data-testid="quizScoreTitle" className={styles.quizScore} tabIndex={0}>
              {otherProps.quizScore}
            </legend>
          ) : (
            <div className={styles.quizScore} data-testid="quizScoreTitle" tabIndex={0}>
              {otherProps.quizCompleted}
            </div>
          )}
          <div className={styles.questionsWrapper}>{showAnswers && renderAnswers}</div>
          <div className={styles.buttonWrapper} data-testid="reviewButtonWrapper">
            {onRetake && (
              <A11yWrapper onClick={handleRetake}>
                <div
                  tabIndex={0}
                  className={styles.primaryButton}
                  aria-label={otherProps.retakeButtonAreaLabel}
                  data-testid="reviewRetakeButton"
                  disabled={isLoading}>
                  {isLoading ? <Spinner /> : otherProps.retakeButton}
                </div>
              </A11yWrapper>
            )}
            <A11yWrapper onClick={onClose}>
              <div
                tabIndex={0}
                data-testid="reviewCloseButton"
                className={[onRetake ? styles.secondaryButton : styles.primaryButton, isLoading ? styles.disabled : ''].join(' ')}
                aria-label={otherProps.closeButtonAriaLabel}>
                {otherProps.closeButton}
              </div>
            </A11yWrapper>
          </div>
        </div>
      </FocusTrap>
    );
  }
);
