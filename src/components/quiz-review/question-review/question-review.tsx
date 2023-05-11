import {h, Fragment} from 'preact';
import {useMemo, useRef, useEffect} from 'preact/hooks';
import {A11yWrapper} from '@playkit-js/common/dist/hoc/a11y-wrapper';
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
    questionLabel: <Text id="ivq.question">Question</Text>
  };
};

export const QuestionReview = withText(translates)(
  ({onBack, onNext, onPrev, questionCounter, reviewQuestion, getSeekBarNode, ...otherProps}: QuestionReviewProps & QuizTranslates) => {
    const backButtonRef = useRef<HTMLDivElement>(null);
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
        const userAnswer = q?.optionalAnswers.find(val => val.key === a?.answerKey);
        return (
          <Fragment>
            <div className={styles.correctAnswerIs} data-testid="reviewCorrectAnswerIs">{`${otherProps.correctAnswerIs} ${correctAnswer?.text}`}</div>
            {a?.explanation && <QuestionAddons explanation={a.explanation} />}
            <div className={styles.yourAnswer} data-testid="reviewYourAnswer">
              {otherProps.yourAnswer}
              <span className={styles.visuallyHidden}>{`: ${userAnswer?.text}`}</span>
            </div>
            <div className={styles.trueFalseAnswerWrapper} role="listbox" aria-hidden="true">
              {q.optionalAnswers.map(({key, text}) => {
                return (
                  <div key={key} className={[styles.trueFalseAnswer, styles.disabled].join(' ')} data-testid="reviewTrueFalseAnswer" role="option">
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
        const userAnswerKeysLabels: Array<string> = [];
        q.optionalAnswers.forEach((optionalAnswer, index) => {
          const isCorrect = correctAnswersKeys?.includes(optionalAnswer.key);
          if (isCorrect) {
            correctAnswers.push(questionLabels[index]);
          }
          if (userAnswerKeys.includes(optionalAnswer.key)) {
            if (isCorrect) {
              userCorrectAnswerKeys.push(optionalAnswer.key);
              userAnswerKeysLabels.push(questionLabels[index]);
            } else {
              userIncorrectAnswerKeys.push(optionalAnswer.key);
              userAnswerKeysLabels.push(questionLabels[index]);
            }
          }
        });
        return (
          <Fragment>
            <div className={styles.correctAnswerIs} data-testid="reviewCorrectMultiChoiceAnswer">{`${
              otherProps.correctAnswerIs
            } ${correctAnswers.join(',')}`}</div>
            {a?.explanation && <QuestionAddons explanation={a.explanation} />}
            <div className={styles.yourAnswer} data-testid="reviewYourMultiChoiceAnswer">
              {otherProps.yourAnswer}
              <span className={styles.visuallyHidden}>{`: ${userAnswerKeysLabels.join(',')}`}</span>
            </div>
            <div className={styles.multiAnswersWrapper} aria-hidden="true">
              <div className={styles.multiAnswersContainer} role="listbox">
                {q.optionalAnswers.map(({key, text}, index) => {
                  const renderIncorrectIcon = userIncorrectAnswerKeys.includes(key);
                  const renderCorrectIcon = userCorrectAnswerKeys.includes(key);
                  return (
                    <div key={key} className={[styles.multiSelectAnswer, styles.disabled].join(' ')} data-testid="multiSelectAnswer" role="option">
                      <div className={styles.questionLabel} data-testid="questionLabel">
                        {questionLabels[index]}
                      </div>
                      <div className={styles.questionContent} data-testid="questionContent">
                        {text}
                      </div>
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
            <div className={styles.openQuestionAnswer} data-testid="openQuestionAnswer">
              {a?.openAnswer}
            </div>
            {a?.explanation && <QuestionAddons explanation={a.explanation} />}
            {a?.feedback && <QuestionAddons feedback={a?.feedback} />}
          </Fragment>
        );
      }
      return null;
    }, [reviewQuestion]);
    return (
      <Fragment>
        <div className={['ivq', styles.questionReviewWrapper].join(' ')} role="dialog" aria-live="polite" data-testid="questionReviewWrapper">
          <div className={styles.backButtonContainer}>
            <A11yWrapper onClick={onBack}>
              <div tabIndex={0} className={styles.backButton} ref={backButtonRef} data-testid="backButton">
                <div className={styles.iconContainer} aria-hidden="true">
                  <Icon id="ivq-chevron-left" height={14} width={9} viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`} path={icons.CHEVRON_LEFT} />
                </div>
                {otherProps.backButton}
              </div>
            </A11yWrapper>
          </div>
          <div className={styles.quizQuestionContainer}>
            <legend className={styles.questionText} data-testid="reviewQuestionText">
              <span className={styles.visuallyHidden}>{`${otherProps.questionLabel} #${reviewQuestion.index + 1}:`}</span>
              {q.question}
            </legend>
            {renderCorrectAnswers}
          </div>
        </div>
        <IvqBottomBar questionCounter={questionCounter} onPrev={onPrev} onNext={onNext} getSeekBarNode={getSeekBarNode} />
      </Fragment>
    );
  }
);
