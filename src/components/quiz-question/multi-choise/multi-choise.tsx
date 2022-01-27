import {h} from 'preact';
import {QuestionProps} from '../../../types';
import * as styles from './multi-choise.scss';

export const MultiChoise = ({question, optionalAnswers, selected, onSelect}: QuestionProps) => {
  return (
    <div className={styles.multiChoiseWrapper}>
      <p>MultiChoise placeholder</p>
    </div>
  );
};
