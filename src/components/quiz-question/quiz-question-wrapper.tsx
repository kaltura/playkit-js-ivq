import {h} from 'preact';
import {QuizQuestionUi} from '../../questions-manager';
import * as styles from './quiz-question-wrapper.scss';

interface QuizQuestionWrapperProps {
  q: QuizQuestionUi;
}

export const QuizQuestionWrapper = ({q}: QuizQuestionWrapperProps) => {
  return (
    <div className={styles.quizQuestionWrapper}>
      <input value={`Question: ${q.q.question}`} disabled />
      {q.onPrev && <button onClick={q.onPrev}>onPrev</button>}
      {q.onNext && <button onClick={q.onNext}>onNext</button>}
      {q.onContinue && <button onClick={q.onContinue}>onContinue</button>}
    </div>
  );
};
