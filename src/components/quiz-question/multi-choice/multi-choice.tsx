import {h} from 'preact';
import {useCallback} from 'preact/hooks';
import {makeQuestionLabels} from '../../../utils';
import {QuestionProps} from '../../../types';
import * as styles from './multi-choice.scss';

interface MultiChoiceProps {
  multiAnswer?: boolean;
}

const questionLabels = makeQuestionLabels();

export const MultiChoice = ({question, optionalAnswers, selected, onSelect, multiAnswer}: QuestionProps & MultiChoiceProps) => {
  const selectedArray = selected ? selected.split(',') : [];

  const handleSelect = useCallback(
    (key: string, isActive: boolean) => () => {
      let newAnswer = key;
      if (multiAnswer) {
        if (isActive) {
          newAnswer = selectedArray.filter(k => k !== key).toString();
        } else {
          newAnswer = [...selectedArray, key].toString();
        }
      }
      onSelect && onSelect(newAnswer);
    },
    [onSelect, selectedArray]
  );

  return (
    <div className={styles.multiChoiceWrapper}>
      <div className={styles.questionText}>{question}</div>
      <div className={styles.optionalAnswersWrapper}>
        <div className={styles.optionalAnswersContainer}>
          {optionalAnswers.map(({key, text}, index) => {
            const isActive = selectedArray.includes(key);
            return (
              <div
                key={key}
                role="button"
                tabIndex={0}
                onClick={handleSelect(key, isActive)}
                className={[styles.multiSelectAnswer, isActive ? styles.active : '', onSelect ? '' : styles.disabled].join(' ')}>
                <div className={styles.questionLabel}>{questionLabels[index]}</div>
                <div className={styles.questionContent}>{text}</div>
              </div>
            );
          })}
        </div>
        <div />
      </div>
    </div>
  );
};
