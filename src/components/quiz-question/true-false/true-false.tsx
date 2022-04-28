import {h} from 'preact';
import {useCallback} from 'preact/hooks';
import {QuestionProps, QuizTranslates} from '../../../types';
import {QuestionAddons} from '../question-addons';
import {A11yWrapper} from '../../a11y-wrapper';
import * as styles from './true-false.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

const translates = (): QuizTranslates => {
  return {
    answerNumber: <Text id="ivq.answer_number">Answer number</Text>,
    yourAnswer: <Text id="ivq.your_answer">Your answer</Text>
  };
};

export const TrueFalse = withText(translates)(
  ({question, optionalAnswers, selected, onSelect, hint, ...otherProps}: QuestionProps & QuizTranslates) => {
    const disabled = !onSelect;
    const handleSelect = useCallback(
      (key: string) => (e: Event, byKeyboard?: boolean) => {
        onSelect && onSelect(key, byKeyboard);
      },
      [onSelect]
    );
    return (
      <div className={styles.trueFalseWrapper} role="alert">
        <legend className={styles.questionText}>{question}</legend>
        {hint && <QuestionAddons hint={hint} />}
        <div className={styles.optionalAnswersWrapper} role="list">
          {optionalAnswers.map(({key, text}, index) => {
            const isActive = selected.includes(key);
            const classes = [styles.trueFalseAnswer, isActive ? styles.active : '', disabled ? styles.disabled : ''].join(' ');
            return (
              <A11yWrapper onClick={handleSelect(key)}>
                <div
                  key={key}
                  tabIndex={disabled ? -1 : 0}
                  className={classes}
                  title={`${otherProps.answerNumber} ${index + 1}${isActive ? `. ${otherProps.yourAnswer}` : ''}`}
                  role="listitem">
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
