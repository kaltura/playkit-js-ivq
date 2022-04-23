import {h} from 'preact';
import {useCallback} from 'preact/hooks';
import {QuestionProps, QuizTranslates} from '../../../types';
import {QuestionAddons} from '../question-addons';
import {A11yWrapper} from '../../a11y-wrapper';
import * as styles from './true-false.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

const translates = (): QuizTranslates => {
  return {
    answerNumber: <Text id="ivq.answer_number">answer number</Text>
  };
};

export const TrueFalse = withText(translates)(
  ({question, optionalAnswers, selected, onSelect, hint, ...translates}: QuestionProps & QuizTranslates) => {
    const disabled = !onSelect;
    const handleSelect = useCallback(
      (key: string) => (e: Event, byKeyboard?: boolean) => {
        onSelect && onSelect(key, byKeyboard);
      },
      [onSelect]
    );
    return (
      <div className={styles.trueFalseWrapper}>
        <div className={styles.questionText} tabIndex={0}>
          {question}
        </div>
        {hint && <QuestionAddons hint={hint} />}
        <div className={styles.optionalAnswersWrapper}>
          {optionalAnswers.map(({key, text}, index) => {
            const isActive = selected.includes(key);
            const classes = [styles.trueFalseAnswer, isActive ? styles.active : '', disabled ? styles.disabled : ''].join(' ');
            return (
              <A11yWrapper onClick={handleSelect(key)}>
                <div key={key} role="button" tabIndex={disabled ? -1 : 0} className={classes} title={`${translates.answerNumber} ${index + 1}`}>
                  {text}
                </div>
              </A11yWrapper>
            );
          })}
        </div>
      </div>
    );
  }
);
