import {h, Fragment} from 'preact';
import {useMemo, useRef, useEffect} from 'preact/hooks';
import {QuizTranslates, QuizQuestion, KalturaQuizQuestionTypes} from '../../../types';
import {makeQuestionLabels} from '../../../utils';
import {icons} from '../../icons';
import {IvqBottomBar} from '../../ivq-bottom-bar';
import {QuestionIcon} from '../question-icon';
import {QuestionAddons} from '../../quiz-question/question-addons';
import * as styles from './question-review.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;
const {Icon} = KalturaPlayer.ui.components;

export interface ReviewQuestion {
  qq: QuizQuestion;
  index: number;
  byKeyboard?: boolean;
}

interface QuestionReviewProps {
  onPrev?: () => void;
  onNext?: () => void;
  questionsAmount: number;
  onBack: () => void;
  reviewQuestion: ReviewQuestion;
  getSeekBarNode: () => Element | null;
}

const translates = ({questionsAmount, reviewQuestion}: QuestionReviewProps): QuizTranslates => {
  return {
    backButton: <Text id="ivq.back_button">Back</Text>,
    questionCounter: (
      <Text
        id="ivq.question_counter"
        fields={{
          current: reviewQuestion.index + 1,
          total: questionsAmount
        }}>{`Question ${reviewQuestion.index + 1} of ${questionsAmount}`}</Text>
    ),
    correctAnswerIs: <Text id="ivq.correct_answer_is">The correct answer is:</Text>,
    yourAnswer: <Text id="ivq.your_answer">Your answer</Text>,
    correctAnswer: <Text id="ivq.correct_answer">The correct answer</Text>,
    incorrectAnswer: <Text id="ivq.incorrect_answer">The incorrect answer</Text>
  };
};

export const QuestionReview = withText(translates)(
  ({onBack, onNext, onPrev, questionCounter, reviewQuestion, getSeekBarNode, ...otherProps}: QuestionReviewProps & QuizTranslates) => {
    const backButtonRef = useRef<HTMLButtonElement>(null);
    const {q, a} = reviewQuestion.qq;

    useEffect(() => {
      if (reviewQuestion.byKeyboard) {
        backButtonRef.current?.focus();
      }
    }, [reviewQuestion]);

    const renderCorrectAnswers = useMemo(() => {
      if (q.questionType === KalturaQuizQuestionTypes.TrueFalse) {
        const correctAnswerKey = a?.correctAnswerKeys[0]?.value;
        const correctAnswer = q?.optionalAnswers.find(val => val.key === correctAnswerKey);
        const isCorrect = a?.answerKey === correctAnswer?.key;
        return (
          <Fragment>
            <div className={styles.correctAnswerIs}>{`${otherProps.correctAnswerIs} ${correctAnswer?.text}`}</div>
            {a?.explanation && <QuestionAddons explanation={a.explanation} />}
            <div className={styles.yourAnswer} aria-hidden="true" aria-label={isCorrect ? otherProps.correctAnswer : otherProps.incorrectAnswer}>
              {isCorrect ? otherProps.correctAnswer : otherProps.yourAnswer}
            </div>
            <div className={styles.trueFalseAnswerWrapper} role="list">
              {q.optionalAnswers.map(({key, text}) => {
                return (
                  <div key={key} className={[styles.trueFalseAnswer, styles.disabled].join(' ')} role="listitem" aria-hidden="true">
                    {text}
                    {a?.answerKey === key && <QuestionIcon questionType={q.questionType} isCorrect={key === correctAnswer?.key} />}
                  </div>
                );
              })}
            </div>
          </Fragment>
        );
      }
      if ([KalturaQuizQuestionTypes.MultiAnswer, KalturaQuizQuestionTypes.MultiChoice].includes(q.questionType)) {
        const questionLabels = makeQuestionLabels();
        const correctAnswersKeys = a?.correctAnswerKeys.map(val => val.value);
        const correctAnswers: Array<string> = [];
        const userCorrectAnswerKeys: Array<string> = [];
        const userIncorrectAnswerKeys: Array<string> = [];
        const userAnswerKeys = a?.answerKey.split(',') || [];
        q.optionalAnswers.forEach((optionalAnswer, index) => {
          const isCorrect = correctAnswersKeys?.includes(optionalAnswer.key);
          if (isCorrect) {
            correctAnswers.push(questionLabels[index]);
          }
          if (userAnswerKeys.includes(optionalAnswer.key)) {
            if (isCorrect) {
              userCorrectAnswerKeys.push(optionalAnswer.key);
            } else {
              userIncorrectAnswerKeys.push(optionalAnswer.key);
            }
          }
        });
        return (
          <Fragment>
            <div className={styles.correctAnswerIs}>{`${otherProps.correctAnswerIs} ${correctAnswers.join(',')}`}</div>
            {a?.explanation && <QuestionAddons explanation={a.explanation} />}
            <div className={styles.yourAnswer}>{otherProps.yourAnswer}</div>
            <div className={styles.multiAnswersWrapper}>
              <div className={styles.multiAnswersContainer} role="list">
                {q.optionalAnswers.map(({key, text}, index) => {
                  const renderIncorrectIcon = userIncorrectAnswerKeys.includes(key);
                  const renderCorrectIcon = userCorrectAnswerKeys.includes(key);
                  return (
                    <div key={key} className={[styles.multiSelectAnswer, styles.disabled].join(' ')} role="listitem">
                      <div className={styles.questionLabel}>{questionLabels[index]}</div>
                      <div className={styles.questionContent}>{text}</div>
                      {renderCorrectIcon && <QuestionIcon questionType={q.questionType} isCorrect={true} />}
                      {renderIncorrectIcon && <QuestionIcon questionType={q.questionType} isCorrect={false} />}
                      {!(renderCorrectIcon || renderIncorrectIcon) && <div className={styles.iconPlaceholder} />}
                    </div>
                  );
                })}
              </div>
              <div className={styles.rightDivider} />
            </div>
          </Fragment>
        );
      }
      if (q.questionType === KalturaQuizQuestionTypes.OpenQuestion) {
        return (
          <Fragment>
            <div className={styles.openQuestionAnswer}>{a?.openAnswer}</div>
            {a?.explanation && <QuestionAddons explanation={a.explanation} />}
            {a?.feedback && <QuestionAddons feedback={a?.feedback} />}
          </Fragment>
        );
      }
      return null;
    }, [reviewQuestion]);
    return (
      <Fragment>
        <div className={['ivq', styles.questionReviewWrapper].join(' ')} role="dialog" aria-live="polite">
          <div className={styles.backButtonContainer}>
            <button onClick={onBack} className={styles.backButton} ref={backButtonRef}>
              <div className={styles.iconContainer} aria-hidden="true">
                <Icon id="ivq-chevron-left" height={14} width={9} viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`} path={icons.CHEVRON_LEFT} />
              </div>
              {otherProps.backButton}
            </button>
          </div>
          <div className={styles.quizQuestionContainer}>
            <div className={styles.questionText}>{q.question}</div>
            {renderCorrectAnswers}
          </div>
        </div>
        <IvqBottomBar questionCounter={questionCounter} onPrev={onPrev} onNext={onNext} getSeekBarNode={getSeekBarNode} />
      </Fragment>
    );
  }
);
