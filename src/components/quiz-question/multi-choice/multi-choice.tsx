import {h} from 'preact';
import {useCallback} from 'preact/hooks';
import {makeQuestionLabels} from '../../../utils';
import {QuestionProps, QuizTranslates} from '../../../types';
import {QuestionAddons} from '../question-addons';
import {A11yWrapper} from '../../a11y-wrapper';
import * as styles from './multi-choice.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

const translates = (): QuizTranslates => {
  return {
    answerNumber: <Text id="ivq.answer_number">answer number</Text>,
    yourAnswer: <Text id="ivq.your_answer">Your answer</Text>
  };
};

interface MultiChoiceProps {
  multiAnswer?: boolean;
}

const questionLabels = makeQuestionLabels();

export const MultiChoice = withText(translates)(
  ({question, optionalAnswers, selected, onSelect, hint, multiAnswer, ...otherProps}: QuestionProps & MultiChoiceProps & QuizTranslates) => {
    const selectedArray = selected ? selected.split(',') : [];
    const disabled = !onSelect;

    const handleSelect = useCallback(
      (key: string, isActive: boolean) => (e: Event, byKeyboard?: boolean) => {
        let newAnswer = key;
        if (multiAnswer) {
          if (isActive) {
            newAnswer = selectedArray.filter(k => k !== key).toString();
          } else {
            newAnswer = [...selectedArray, key].toString();
          }
        }
        onSelect && onSelect(newAnswer, byKeyboard);
      },
      [onSelect, selectedArray]
    );

    return (
      <div className={styles.multiChoiceWrapper} data-testid="multipleChoiceContainer" role="alert">
        <legend className={styles.questionText} data-testid="multipleChoiceQuestionTitle">{question}</legend>
        {hint && <QuestionAddons hint={hint} />}
        <div className={styles.optionalAnswersWrapper} data-testid="multipleChoiceAnswersWrapper">
          <div className={styles.optionalAnswersContainer} role="list" data-testid="multipleChoiceAnswersContainer">
            {optionalAnswers.map(({key, text}, index) => {
              const isActive = selectedArray.includes(key);
              return (
                <A11yWrapper onClick={handleSelect(key, isActive)}>
                  <div
                    key={key}
                    role="listitem"
                    tabIndex={disabled ? -1 : 0}
                    data-testid="multipleChoiceSelectAnswer"
                    title={`${otherProps.answerNumber} ${index + 1}${isActive ? `. ${otherProps.yourAnswer}` : ''}`}
                    className={[styles.multiSelectAnswer, isActive ? styles.active : '', disabled ? styles.disabled : ''].join(' ')}>
                    <div className={styles.questionLabel} data-testid="multipleChoiceQuestionLabel" role="text">
                      {questionLabels[index]}
                    </div>
                    <div className={styles.questionContent} data-testid="multipleChoiceQuestionContent" role="text">
                      {text}
                    </div>
                  </div>
                </A11yWrapper>
              );
            })}
          </div>
          <div />
        </div>
      </div>
    );
  }
);
