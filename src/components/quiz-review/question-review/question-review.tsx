import {h, VNode} from 'preact';
// import {useCallback} from 'preact/hooks';
import {QuizTranslates, QuizQuestion} from '../../../types';
import {icons} from '../../icons';
import {IvqBottomBar} from '../../ivq-bottom-bar';
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
    )
  };
};

export const QuestionReview = withText(translates)(
  ({onBack, onNext, onPrev, questionCounter, quizQuestion, ...translates}: QuestionReviewProps & QuizTranslates) => {
    return (
      <div className={styles.questionReviewWrapper}>
        <div className={styles.backButtonContainer}>
          <button onClick={onBack} className={styles.backButton}>
            <div className={styles.iconContainer}>
              <Icon id="ivq-chevron-left" height={14} width={9} viewBox={`0 0 ${icons.SmallSize} ${icons.SmallSize}`} path={icons.CHEVRON_LEFT} />
            </div>
            {translates.backButton}
          </button>
        </div>
        <IvqBottomBar questionCounter={questionCounter} onPrev={onPrev} onNext={onNext} />
      </div>
    );
  }
);
