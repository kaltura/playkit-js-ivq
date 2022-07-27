import {h} from 'preact';
import {KalturaQuizQuestionTypes, QuizQuestion} from '../../../types';
import {icons} from '../../icons';
import * as styles from './question-icon.scss';

const {Icon} = KalturaPlayer.ui.components;

interface QuestionIconProps {
  questionType: KalturaQuizQuestionTypes;
  isCorrect?: boolean;
}

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

const renderQuestionIcon = (questionType: KalturaQuizQuestionTypes, isCorrect?: boolean) => {
  switch (questionType) {
    case KalturaQuizQuestionTypes.OpenQuestion:
      return [renderOpenQuestionIcon(), styles.defaultIcon];
    case KalturaQuizQuestionTypes.Reflection:
      return [renderReflectionPointIcon(), styles.defaultIcon];
    default:
      return isCorrect ? [renderCorrectAnswerIcon(), styles.correctAnswer] : [renderIncorrectAnswerIcon(), styles.incorrectAnswer];
  }
};

export const QuestionIcon = ({questionType, isCorrect}: QuestionIconProps) => {
  const [questionIcon, questionIconStyles] = renderQuestionIcon(questionType, isCorrect);
  return <div className={[styles.questionIcon, questionIconStyles].join(' ')} data-testid="reviewQuestionIcon">{questionIcon}</div>;
};
