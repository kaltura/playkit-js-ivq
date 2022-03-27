import {h} from 'preact';
import {useCallback} from 'preact/hooks';
import {QuestionProps} from '../../../types';
import {QuestionAddons} from '../question-addons';
import {A11yWrapper} from '../../a11y-wrapper';
import * as styles from './true-false.scss';

export const TrueFalse = ({question, optionalAnswers, selected, onSelect, hint}: QuestionProps) => {
  const handleSelect = useCallback(
    (key: string) => (e: Event, byKeyboard?: boolean) => {
      onSelect && onSelect(key, byKeyboard);
    },
    [onSelect]
  );
  return (
    <div className={styles.trueFalseWrapper}>
      <div className={styles.questionText}>{question}</div>
      {hint && <QuestionAddons hint={hint} />}
      <div className={styles.optionalAnswersWrapper}>
        {optionalAnswers.map(({key, text}) => {
          const isActive = selected.includes(key);
          const classes = [styles.trueFalseAnswer, isActive ? styles.active : '', onSelect ? '' : styles.disabled].join(' ');
          return (
            <A11yWrapper onClick={handleSelect(key)}>
              <div key={key} role="button" tabIndex={0} className={classes}>
                {text}
              </div>
            </A11yWrapper>
          );
        })}
      </div>
    </div>
  );
};
