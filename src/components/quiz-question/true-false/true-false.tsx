import {h} from 'preact';
import {useCallback} from 'preact/hooks';
import {QuestionProps} from '../../../types';
import {Hint} from '../hint';
import * as styles from './true-false.scss';

export const TrueFalse = ({question, optionalAnswers, selected, onSelect, hint}: QuestionProps) => {
  const handleSelect = useCallback(
    (key: string) => () => {
      onSelect && onSelect(key);
    },
    [onSelect]
  );
  return (
    <div className={styles.trueFalseWrapper}>
      <div className={styles.questionText}>{question}</div>
      {hint && <Hint hint={hint} />}
      <div className={styles.optionalAnswersWrapper}>
        {optionalAnswers.map(({key, text}) => {
          const isActive = selected.includes(key);
          const classes = [styles.trueFalseAnswer, isActive ? styles.active : '', onSelect ? '' : styles.disabled].join(' ');
          return (
            <div key={key} role="button" tabIndex={0} onClick={handleSelect(key)} className={classes}>
              {text}
            </div>
          );
        })}
      </div>
    </div>
  );
};
