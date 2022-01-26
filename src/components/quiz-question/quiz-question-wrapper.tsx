import {h} from 'preact';
import {QuizQuestionUi} from '../../questions-manager';
import * as styles from './quiz-question-wrapper.scss';

interface QuizQuestionWrapperProps {
  q: QuizQuestionUi;
}

export const QuizQuestionWrapper = ({q}: QuizQuestionWrapperProps) => {
  return <div className={styles.quizQuestionWrapper}></div>;
};
