import {h} from 'preact';
import {useCallback, useEffect, useRef} from 'preact/hooks';
import {QuestionProps, QuizTranslates} from '../../../types';
import {QuestionAddons} from '../question-addons';
import {A11yWrapper} from '@playkit-js/common/dist/hoc/a11y-wrapper';
import * as styles from './true-false.scss';

const {withText, Text} = KalturaPlayer.ui.preacti18n;

const translates = (): QuizTranslates => {
  return {
    answerNumber: <Text id="ivq.answer_number">Answer number</Text>,
    yourAnswer: <Text id="ivq.your_answer">Your answer</Text>,
    questionLabel: <Text id="ivq.question">Question</Text>
  };
};

export const TrueFalse = withText(translates)(
  ({question, optionalAnswers, selected, onSelect, hint, questionIndex, ...otherProps}: QuestionProps & QuizTranslates) => {
    const disabled = !onSelect;
    const handleSelect = useCallback(
      (key: string) => (e: Event, byKeyboard?: boolean) => {
        onSelect && onSelect(key, byKeyboard);
      },
      [onSelect]
    );
    const quizQuestionRef = useRef<HTMLLegendElement>(null);
    useEffect(() => {
      if (!disabled) {
        quizQuestionRef.current?.focus();
      }
    }, [question]);

    let answersOptionsRefMap: Map<number, HTMLElement | null> = new Map();
    useEffect(() => {
      return () => {
        answersOptionsRefMap = new Map();
      };
    }, []);

    const setAnswerOptionRef = (index: number, ref: HTMLElement | null) => {
      return answersOptionsRefMap.set(index, ref);
    };

    const getAnswerOptionRef = (index: number) => {
      return answersOptionsRefMap.get(index);
    };

    const handleLeftKeyPressed = (currentIndex: number) => {
      getAnswerOptionRef(currentIndex - 1)?.focus();
    };

    const handleRightKeyPressed = (currentIndex: number) => {
      getAnswerOptionRef(currentIndex + 1)?.focus();
    };

    return (
      <div className={styles.trueFalseWrapper} data-testid="trueFalseContainer">
        <legend className={styles.questionText} data-testid="trueFalseQuestionTitle" tabIndex={0} role="text" ref={quizQuestionRef}>
          <span className={styles.visuallyHidden}>{`${otherProps.questionLabel} #${questionIndex}:`}</span>
          {question}
        </legend>
        {hint && <QuestionAddons hint={hint} />}
        <div className={styles.optionalAnswersWrapper} role="listbox" data-testid="trueFalseAnswersContainer">
          {optionalAnswers.map(({key, text}, index) => {
            const isActive = selected.includes(key);
            const classes = [styles.trueFalseAnswer, isActive ? styles.active : '', disabled ? styles.disabled : ''].join(' ');
            return (
              <A11yWrapper
                onClick={handleSelect(key)}
                onUpKeyPressed={() => {}}
                onDownKeyPressed={() => {}}
                onLeftKeyPressed={() => handleLeftKeyPressed(index)}
                onRightKeyPressed={() => handleRightKeyPressed(index)}
                role="option">
                <div
                  ref={node => {
                    setAnswerOptionRef(index, node);
                  }}
                  key={key}
                  tabIndex={0}
                  data-testid="trueFalseAnswerContent"
                  aria-selected={isActive}
                  aria-disabled={disabled}
                  className={classes}
                  aria-label={`${otherProps.answerNumber} ${index + 1}, ${text}${isActive ? `. ${otherProps.yourAnswer}` : ''}`}>
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
