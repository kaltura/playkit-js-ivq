import {h} from 'preact';
import {QuizQuestionUI} from '../../questions-manager';
import * as styles from './quiz-question-wrapper.scss';

interface QuizQuestionWrapperProps {
  q: QuizQuestionUI;
}

export const QuizQuestionWrapper = ({q}: QuizQuestionWrapperProps) => {
  return <div className={styles.quizQuestionWrapper}></div>;
};
