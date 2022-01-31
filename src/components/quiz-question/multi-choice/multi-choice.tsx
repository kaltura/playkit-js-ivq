import {h} from 'preact';
import {useCallback} from 'preact/hooks';
import {QuestionProps} from '../../../types';
import * as styles from './multi-choice.scss';

export const MultiChoice = ({question, optionalAnswers, selected, onSelect}: QuestionProps) => {
  const handleSelect = useCallback(
    (key: string) => () => {
      onSelect(key);
    },
    [onSelect]
  );
  return (
    <div className={styles.multiChoiceWrapper}>
      <div className={styles.questionText}>{question}</div>
      <div className={styles.optionalAnswersWrapper}>
        <div className={styles.optionalAnswersContainer}>
          {optionalAnswers.map(({key, text}) => {
            const isActive = selected.includes(key);
            return (
              <div
                key={key}
                role="button"
                tabIndex={0}
                onClick={handleSelect(key)}
                className={[styles.quizOptionalAnswer, styles.multiSelectAnswer, isActive ? styles.active : ''].join(' ')}>
                {text}
              </div>
            );
          })}
        </div>
        <div />
      </div>
    </div>
  );
};
