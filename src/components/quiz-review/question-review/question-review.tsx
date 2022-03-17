import {h, Fragment} from 'preact';
import {useMemo} from 'preact/hooks';
import {QuizTranslates, QuizQuestion, KalturaQuizQuestionTypes} from '../../../types';
import {makeQuestionLabels} from '../../../utils';
import {icons} from '../../icons';
import {IvqBottomBar} from '../../ivq-bottom-bar';
import {QuestionIcon} from '../question-icon';
import {Hint} from '../../quiz-question/hint';
import * as styles from './question-review.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;
const {Icon} = KalturaPlayer.ui.components;

export interface ReviewQuestion {
  qq: QuizQuestion;
  index: number;
}

interface QuestionReviewProps {
  onPrev?: () => void;
  onNext?: () => void;
  questionsAmount: number;
  onBack: () => void;
  reviewQuestion: ReviewQuestion;
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
    correctAnswer: <Text id="ivq.correct_answer">The correct answer</Text>
  };
};

export const QuestionReview = withText(translates)(
  ({onBack, onNext, onPrev, questionCounter, reviewQuestion, ...translates}: QuestionReviewProps & QuizTranslates) => {
    const {q, a} = reviewQuestion.qq;
    const renderCorrectAnswers = useMemo(() => {
      if (q.questionType === KalturaQuizQuestionTypes.TrueFalse) {
        const correctAnswer = q.optionalAnswers.find(val => val.isCorrect);
        return (
          <Fragment>
            <div className={styles.correctAnswerIs}>{`${translates.correctAnswerIs} ${correctAnswer?.text}`}</div>
            {q.explanation && <Hint explanation={q.explanation} />}
            <div className={styles.yourAnswer}>{a?.answerKey === correctAnswer?.key ? translates.correctAnswer : translates.yourAnswer}</div>
            <div className={styles.trueFalseAnswerWrapper}>
              {q.optionalAnswers.map(({key, text}) => {
                return (
                  <div key={key} className={[styles.trueFalseAnswer, styles.disabled].join(' ')}>
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
        const correctAnswers: Array<string> = [];
        const userCorrectAnswerKeys: Array<string> = [];
        const userIncorrectAnswerKeys: Array<string> = [];
        const userAnswerKeys = a?.answerKey.split(',') || [];
        q.optionalAnswers.forEach((optionalAnswer, index) => {
          if (optionalAnswer.isCorrect) {
            correctAnswers.push(questionLabels[index]);
          }
          if (userAnswerKeys.includes(optionalAnswer.key)) {
            if (optionalAnswer.isCorrect) {
              userCorrectAnswerKeys.push(optionalAnswer.key);
            } else {
              userIncorrectAnswerKeys.push(optionalAnswer.key);
            }
          }
        });
        return (
          <Fragment>
            <div className={styles.correctAnswerIs}>{`${translates.correctAnswerIs} ${correctAnswers.join(',')}`}</div>
            {q.explanation && <Hint explanation={q.explanation} />}
            <div className={styles.yourAnswer}>{translates.yourAnswer}</div>
            <div className={styles.multiAnswersWrapper}>
              <div className={styles.multiAnswersContainer}>
                {q.optionalAnswers.map(({key, text}, index) => {
                  return (
                    <div key={key} className={[styles.multiSelectAnswer, styles.disabled].join(' ')}>
                      <div className={styles.questionLabel}>{questionLabels[index]}</div>
                      <div className={styles.questionContent}>{text}</div>
                      {userCorrectAnswerKeys.includes(key) && <QuestionIcon questionType={q.questionType} isCorrect={true} />}
                      {userIncorrectAnswerKeys.includes(key) && <QuestionIcon questionType={q.questionType} isCorrect={false} />}
                    </div>
                  );
                })}
              </div>
              <div />
            </div>
          </Fragment>
        );
      }
      if (q.questionType === KalturaQuizQuestionTypes.OpenQuestion) {
        return (
          <Fragment>
            <div className={styles.openQuestionAnswer}>{a?.openAnswer}</div>
            {a?.feedback && <Hint feedback={a?.feedback} />}
          </Fragment>
        );
      }
      return null;
    }, [reviewQuestion]);
    return (
      <Fragment>
        <div className={styles.questionReviewWrapper}>
          <div className={styles.backButtonContainer}>
            <button onClick={onBack} className={styles.backButton}>
              <div className={styles.iconContainer}>
                <Icon id="ivq-chevron-left" height={14} width={9} viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`} path={icons.CHEVRON_LEFT} />
              </div>
              {translates.backButton}
            </button>
          </div>
          <div className={styles.quizQuestionContainer}>
            <div className={styles.questionText}>{q.question}</div>
            {renderCorrectAnswers}
          </div>
        </div>
        <IvqBottomBar questionCounter={questionCounter} onPrev={onPrev} onNext={onNext} />
      </Fragment>
    );
  }
);
