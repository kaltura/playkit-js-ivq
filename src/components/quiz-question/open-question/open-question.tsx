import {h} from 'preact';
import {QuestionProps} from '../../../types';
import * as styles from './open-question.scss';

export const OpenQuestion = ({question, optionalAnswers, selected, onSelect}: QuestionProps) => {
  return (
    <div className={styles.openQuestionWrapper}>
      <p>OpenQuestion placeholder</p>
    </div>
  );
};
